/**
 * منصة إدارة المدرسة الابتدائية
 * مدير واجهة المستخدم - مسؤول عن التفاعل مع المستخدم وعرض العناصر
 */

const UI = {
    // تهيئة واجهة المستخدم
    init: function() {
        console.log('تهيئة واجهة المستخدم...');
        this.setupEventListeners();
        this.setupMobileMenu();
        this.loadSchoolLogo();
    },

    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        // مستمعي أحداث التنقل
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                App.changePage(page);
            });
        });

        // إضافة مستمع لأحداث الطباعة
        window.addEventListener('beforeprint', function() {
            document.body.classList.add('printing');
        });

        window.addEventListener('afterprint', function() {
            document.body.classList.remove('printing');
        });
    },

    // إعداد القائمة للأجهزة المحمولة
    setupMobileMenu: function() {
        // إضافة زر القائمة للأجهزة المحمولة
        const topBar = document.querySelector('.top-bar .row');
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'col-2 d-lg-none mobile-toggle';
        mobileToggle.innerHTML = '<button class="btn btn-sm" id="mobile-menu-toggle"><i class="fas fa-bars"></i></button>';
        topBar.prepend(mobileToggle);

        // إضافة مستمع حدث لزر القائمة
        document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('show');
        });

        // إغلاق القائمة عند النقر خارجها
        document.querySelector('.main-content').addEventListener('click', function() {
            if (window.innerWidth < 992) {
                document.querySelector('.sidebar').classList.remove('show');
            }
        });
    },

    // تحميل شعار المدرسة
    loadSchoolLogo: function() {
        if (App.state.schoolInfo && App.state.schoolInfo.logo) {
            document.querySelector('.school-logo img').src = App.state.schoolInfo.logo;
        }
    },

    // عرض إشعار للمستخدم
    showNotification: function(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // تحديد أيقونة الإشعار حسب النوع
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        // إضافة محتوى الإشعار
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // إضافة الإشعار إلى الصفحة
        document.body.appendChild(notification);
        
        // إظهار الإشعار بعد إضافته
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // إضافة مستمع حدث لزر الإغلاق
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // إخفاء الإشعار تلقائيًا بعد 5 ثوانٍ
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    },

    // إنشاء نموذج بحث وتصفية
    createSearchFilter: function(options) {
        const { onSearch, filters, filterOptions } = options;
        
        const container = document.createElement('div');
        container.className = 'search-filter-container mb-4';
        
        let filtersHTML = '';
        
        // إضافة حقول التصفية إذا كانت موجودة
        if (filters && filters.length > 0) {
            filters.forEach(filter => {
                const options = filterOptions[filter.name].map(option => 
                    `<option value="${option.value}">${option.label}</option>`
                ).join('');
                
                filtersHTML += `
                    <div class="col-md-${filter.size || 3}">
                        <label for="filter-${filter.name}" class="form-label">${filter.label}</label>
                        <select class="form-select" id="filter-${filter.name}" data-filter="${filter.name}">
                            <option value="all">الكل</option>
                            ${options}
                        </select>
                    </div>
                `;
            });
        }
        
        container.innerHTML = `
            <div class="row">
                <div class="col-md-${filters && filters.length > 0 ? '6' : '12'}">
                    <label for="search-input" class="form-label">بحث</label>
                    <input type="text" class="form-control" id="search-input" placeholder="اكتب للبحث...">
                </div>
                ${filtersHTML}
            </div>
        `;
        
        // إضافة مستمع حدث للبحث
        setTimeout(() => {
            const searchInput = container.querySelector('#search-input');
            const filterSelects = container.querySelectorAll('select[data-filter]');
            
            // دالة لجمع قيم التصفية
            const getFilterValues = () => {
                const values = {};
                filterSelects.forEach(select => {
                    values[select.getAttribute('data-filter')] = select.value;
                });
                return values;
            };
            
            // مستمع حدث للبحث
            searchInput.addEventListener('input', function() {
                onSearch(this.value, getFilterValues());
            });
            
            // مستمع حدث للتصفية
            filterSelects.forEach(select => {
                select.addEventListener('change', function() {
                    onSearch(searchInput.value, getFilterValues());
                });
            });
        }, 0);
        
        return container;
    },

    // إنشاء جدول بيانات
    createDataTable: function(options) {
        const { columns, data, actions, onEdit, onDelete, onView } = options;
        
        const table = document.createElement('div');
        table.className = 'table-container';
        
        // إنشاء رؤوس الأعمدة
        let headerHTML = '';
        columns.forEach(column => {
            headerHTML += `<th scope="col">${column.label}</th>`;
        });
        
        // إضافة عمود الإجراءات إذا كانت مطلوبة
        if (actions) {
            headerHTML += '<th scope="col">الإجراءات</th>';
        }
        
        // إنشاء صفوف البيانات
        let rowsHTML = '';
        if (data.length === 0) {
            rowsHTML = `<tr><td colspan="${columns.length + (actions ? 1 : 0)}" class="text-center">لا توجد بيانات</td></tr>`;
        } else {
            data.forEach(item => {
                let rowHTML = '<tr>';
                
                // إضافة خلايا البيانات
                columns.forEach(column => {
                    let cellValue = '';
                    
                    // التعامل مع الحقول المتداخلة مثل student.firstName
                    if (column.field.includes('.')) {
                        const fields = column.field.split('.');
                        let value = item;
                        for (const field of fields) {
                            value = value && value[field];
                        }
                        cellValue = value;
                    } else {
                        cellValue = item[column.field];
                    }
                    
                    // تطبيق دالة التنسيق إذا كانت موجودة
                    if (column.formatter) {
                        cellValue = column.formatter(cellValue, item);
                    }
                    
                    rowHTML += `<td>${cellValue}</td>`;
                });
                
                // إضافة أزرار الإجراءات
                if (actions) {
                    rowHTML += '<td><div class="table-actions">';
                    
                    if (actions.view && onView) {
                        rowHTML += `<button class="btn btn-sm btn-info view-btn" data-id="${item.id}" title="عرض"><i class="fas fa-eye"></i></button>`;
                    }
                    
                    if (actions.edit && onEdit) {
                        rowHTML += `<button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}" title="تعديل"><i class="fas fa-edit"></i></button>`;
                    }
                    
                    if (actions.delete && onDelete) {
                        rowHTML += `<button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}" title="حذف"><i class="fas fa-trash"></i></button>`;
                    }
                    
                    if (actions.custom) {
                        actions.custom.forEach(action => {
                            rowHTML += `<button class="btn btn-sm ${action.btnClass} ${action.className}" data-id="${item.id}" title="${action.title}"><i class="fas fa-${action.icon}"></i></button>`;
                        });
                    }
                    
                    rowHTML += '</div></td>';
                }
                
                rowHTML += '</tr>';
                rowsHTML += rowHTML;
            });
        }
        
        // إنشاء الجدول
        table.innerHTML = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        ${headerHTML}
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>
        `;
        
        // إضافة مستمعي الأحداث للأزرار
        setTimeout(() => {
            if (actions) {
                if (actions.view && onView) {
                    table.querySelectorAll('.view-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            onView(id);
                        });
                    });
                }
                
                if (actions.edit && onEdit) {
                    table.querySelectorAll('.edit-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            onEdit(id);
                        });
                    });
                }
                
                if (actions.delete && onDelete) {
                    table.querySelectorAll('.delete-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const id = this.getAttribute('data-id');
                            onDelete(id);
                        });
                    });
                }
                
                if (actions.custom) {
                    actions.custom.forEach(action => {
                        table.querySelectorAll(`.${action.className}`).forEach(btn => {
                            btn.addEventListener('click', function() {
                                const id = this.getAttribute('data-id');
                                action.onClick(id);
                            });
                        });
                    });
                }
            }
        }, 0);
        
        return table;
    },

    // إنشاء نموذج
    createForm: function(options) {
        const { fields, values, onSubmit, submitText = 'حفظ', cancelText = 'إلغاء', onCancel } = options;
        
        const form = document.createElement('form');
        form.className = 'row g-3';
        
        // إنشاء حقول النموذج
        fields.forEach(field => {
            const fieldValue = values && values[field.name] ? values[field.name] : '';
            
            let fieldHTML = '';
            
            switch (field.type) {
                case 'text':
                case 'email':
                case 'tel':
                case 'number':
                case 'date':
                    fieldHTML = `
                        <div class="col-md-${field.size || 6}">
                            <label for="${field.name}" class="form-label">${field.label}</label>
                            <input type="${field.type}" class="form-control" id="${field.name}" name="${field.name}" value="${fieldValue}" ${field.required ? 'required' : ''}>
                            ${field.helpText ? `<small class="form-text text-muted">${field.helpText}</small>` : ''}
                        </div>
                    `;
                    break;
                
                case 'select':
                    const options = field.options.map(option => 
                        `<option value="${option.value}" ${fieldValue === option.value ? 'selected' : ''}>${option.label}</option>`
                    ).join('');
                    
                    fieldHTML = `
                        <div class="col-md-${field.size || 6}">
                            <label for="${field.name}" class="form-label">${field.label}</label>
                            <select class="form-select" id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="" disabled ${!fieldValue ? 'selected' : ''}>اختر...</option>
                                ${options}
                            </select>
                            ${field.helpText ? `<small class="form-text text-muted">${field.helpText}</small>` : ''}
                        </div>
                    `;
                    break;
                
                case 'textarea':
                    fieldHTML = `
                        <div class="col-md-${field.size || 12}">
                            <label for="${field.name}" class="form-label">${field.label}</label>
                            <textarea class="form-control" id="${field.name}" name="${field.name}" rows="${field.rows || 3}" ${field.required ? 'required' : ''}>${fieldValue}</textarea>
                            ${field.helpText ? `<small class="form-text text-muted">${field.helpText}</small>` : ''}
                        </div>
                    `;
                    break;
                
                case 'radio':
                    const radioOptions = field.options.map(option => `
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="${field.name}" id="${field.name}-${option.value}" value="${option.value}" ${fieldValue === option.value ? 'checked' : ''} ${field.required ? 'required' : ''}>
                            <label class="form-check-label" for="${field.name}-${option.value}">${option.label}</label>
                        </div>
                    `).join('');
                    
                    fieldHTML = `
                        <div class="col-md-${field.size || 6}">
                            <label class="form-label d-block">${field.label}</label>
                            ${radioOptions}
                            ${field.helpText ? `<small class="form-text text-muted">${field.helpText}</small>` : ''}
                        </div>
                    `;
                    break;
                
                case 'checkbox':
                    fieldHTML = `
                        <div class="col-md-${field.size || 6}">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="${field.name}" name="${field.name}" ${fieldValue ? 'checked' : ''}>
                                <label class="form-check-label" for="${field.name}">${field.label}</label>
                            </div>
                            ${field.helpText ? `<small class="form-text text-muted">${field.helpText}</small>` : ''}
                        </div>
                    `;
                    break;
                
                case 'hidden':
                    fieldHTML = `<input type="hidden" id="${field.name}" name="${field.name}" value="${fieldValue}">`;
                    break;
            }
            
            form.innerHTML += fieldHTML;
        });
        
        // إضافة أزرار الإرسال والإلغاء
        form.innerHTML += `
            <div class="col-12 mt-4 text-start">
                <button type="submit" class="btn btn-primary">${submitText}</button>
                ${onCancel ? `<button type="button" class="btn btn-secondary ms-2" id="cancel-form">${cancelText}</button>` : ''}
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        setTimeout(() => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // جمع بيانات النموذج
                const formData = {};
                fields.forEach(field => {
                    if (field.type === 'checkbox') {
                        formData[field.name] = document.getElementById(field.name).checked;
                    } else if (field.type === 'radio') {
                        const selectedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
                        formData[field.name] = selectedRadio ? selectedRadio.value : '';
                    } else {
                        formData[field.name] = document.getElementById(field.name).value;
                    }
                });
                
                onSubmit(formData);
            });
            
            if (onCancel) {
                document.getElementById('cancel-form').addEventListener('click', onCancel);
            }
        }, 0);
        
        return form;
    },

    // إنشاء مربع حوار
    createModal: function(options) {
        const { id, title, content, size, onClose } = options;
        
        // التحقق من وجود المربع الحواري مسبقًا وإزالته
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }
        
        // إنشاء المربع الحواري
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = id;
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', `${id}Label`);
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog ${size ? `modal-${size}` : ''}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${id}Label">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                    </div>
                    <div class="modal-body">
                        ${typeof content === 'string' ? content : ''}
                    </div>
                </div>
            </div>
        `;
        
        // إضافة المربع الحواري إلى الصفحة
        document.body.appendChild(modal);
        
        // إذا كان المحتوى عنصر DOM، إضافته إلى جسم المربع الحواري
        if (typeof content !== 'string' && content instanceof HTMLElement) {
            modal.querySelector('.modal-body').appendChild(content);
        }
        
        // إنشاء كائن المربع الحواري
        const modalInstance = new bootstrap.Modal(modal);
        
        // إضافة مستمع حدث للإغلاق
        if (onClose) {
            modal.addEventListener('hidden.bs.modal', onClose);
        }
        
        // إرجاع كائن يحتوي على المربع الحواري وطرق التحكم به
        return {
            element: modal,
            instance: modalInstance,
            show: function() {
                modalInstance.show();
            },
            hide: function() {
                modalInstance.hide();
            },
            setContent: function(newContent) {
                const modalBody = modal.querySelector('.modal-body');
                modalBody.innerHTML = '';
                
                if (typeof newContent === 'string') {
                    modalBody.innerHTML = newContent;
                } else if (newContent instanceof HTMLElement) {
                    modalBody.appendChild(newContent);
                }
            }
        };
    },

    // إنشاء بطاقة
    createCard: function(options) {
        const { title, content, footer, headerActions } = options;
        
        const card = document.createElement('div');
        card.className = 'card mb-4';
        
        let headerHTML = '';
        if (title) {
            headerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${title}</h5>
                    ${headerActions ? `<div class="header-actions">${headerActions}</div>` : ''}
                </div>
            `;
        }
        
        let footerHTML = '';
        if (footer) {
            footerHTML = `<div class="card-footer">${footer}</div>`;
        }
        
        card.innerHTML = `
            ${headerHTML}
            <div class="card-body">
                ${typeof content === 'string' ? content : ''}
            </div>
            ${footerHTML}
        `;
        
        // إذا كان المحتوى عنصر DOM، إضافته إلى جسم البطاقة
        if (typeof content !== 'string' && content instanceof HTMLElement) {
            card.querySelector('.card-body').appendChild(content);
        }
        
        return card;
    },

    // إنشاء زر طباعة
    createPrintButton: function(options = {}) {
        const { text = 'طباعة', className = 'btn-info', icon = 'print', onClick } = options;
        
        const button = document.createElement('button');
        button.className = `btn ${className}`;
        button.innerHTML = `<i class="fas fa-${icon} me-1"></i> ${text}`;
        
        button.addEventListener('click', function() {
            if (onClick) {
                onClick();
            } else {
                window.print();
            }
        });
        
        return button;
    },

    // تنسيق التاريخ
    formatDate: function(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('ar-DZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // تنسيق العملة
    formatCurrency: function(amount) {
        if (amount === undefined || amount === null) return '';
        
        return parseFloat(amount).toLocaleString('ar-DZ') + ' دج';
    }
};