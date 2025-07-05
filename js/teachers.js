/**
 * منصة إدارة المدرسة الابتدائية
 * مدير الأساتذة والمشرفين - مسؤول عن إدارة بيانات الأساتذة وشهادات العمل
 */

const TeachersManager = {
    // تهيئة مدير الأساتذة
    init: function() {
        console.log('تهيئة مدير الأساتذة...');
    },

    // تحميل صفحة الأساتذة
    loadTeachersPage: function() {
        const teachersPage = document.getElementById('teachers-page');
        
        // إنشاء محتوى الصفحة
        teachersPage.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h4>قائمة الأساتذة والمشرفين</h4>
                </div>
                <div class="col-md-6 text-start">
                    <button id="add-teacher-btn" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> إضافة أستاذ/مشرف جديد
                    </button>
                </div>
            </div>
            
            <div id="search-filter-container"></div>
            
            <div id="teachers-table-container"></div>
        `;
        
        // إضافة مستمع حدث لزر إضافة أستاذ
        document.getElementById('add-teacher-btn').addEventListener('click', () => {
            this.showTeacherForm();
        });
        
        // إنشاء حقل البحث والتصفية
        const searchFilterContainer = document.getElementById('search-filter-container');
        const searchFilter = UI.createSearchFilter({
            onSearch: (query, filters) => {
                this.searchTeachers(query, filters);
            },
            filters: [
                { name: 'specialty', label: 'التخصص', size: 3 }
            ],
            filterOptions: {
                specialty: [
                    { value: 'معلم فصل', label: 'معلم فصل' },
                    { value: 'لغة عربية', label: 'لغة عربية' },
                    { value: 'لغة فرنسية', label: 'لغة فرنسية' },
                    { value: 'لغة إنجليزية', label: 'لغة إنجليزية' },
                    { value: 'رياضيات', label: 'رياضيات' },
                    { value: 'علوم', label: 'علوم' },
                    { value: 'تربية إسلامية', label: 'تربية إسلامية' },
                    { value: 'تربية بدنية', label: 'تربية بدنية' },
                    { value: 'تربية فنية', label: 'تربية فنية' },
                    { value: 'مشرف تربوي', label: 'مشرف تربوي' },
                    { value: 'أخرى', label: 'أخرى' }
                ]
            }
        });
        searchFilterContainer.appendChild(searchFilter);
        
        // عرض جميع الأساتذة
        this.searchTeachers('', { specialty: 'all' });
    },

    // البحث عن الأساتذة وعرضهم
    searchTeachers: function(query, filters) {
        const teachers = DataManager.searchTeachers(query, filters);
        this.displayTeachers(teachers);
    },

    // عرض قائمة الأساتذة
    displayTeachers: function(teachers) {
        const tableContainer = document.getElementById('teachers-table-container');
        
        // تعريف أعمدة الجدول
        const columns = [
            { field: 'firstName', label: 'الاسم' },
            { field: 'lastName', label: 'اللقب' },
            { field: 'specialty', label: 'التخصص' },
            { field: 'rank', label: 'الرتبة' },
            { field: 'hireDate', label: 'تاريخ التوظيف', formatter: (value) => UI.formatDate(value) },
            { field: 'phone', label: 'رقم الهاتف' }
        ];
        
        // إنشاء الجدول
        const table = UI.createDataTable({
            columns: columns,
            data: teachers,
            actions: {
                view: true,
                edit: true,
                delete: true,
                custom: [
                    {
                        btnClass: 'btn-secondary',
                        className: 'print-certificate-btn',
                        icon: 'file-alt',
                        title: 'طباعة شهادة عمل',
                        onClick: (id) => this.printWorkCertificate(id)
                    }
                ]
            },
            onView: (id) => this.viewTeacher(id),
            onEdit: (id) => this.editTeacher(id),
            onDelete: (id) => this.deleteTeacher(id)
        });
        
        // إضافة الجدول إلى الحاوية
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    },

    // عرض نموذج إضافة/تعديل أستاذ
    showTeacherForm: function(teacherId = null) {
        // تحديد ما إذا كنا نقوم بإضافة أو تعديل
        const isEditing = teacherId !== null;
        const teacher = isEditing ? DataManager.getTeacherById(teacherId) : null;
        
        // تعريف حقول النموذج
        const fields = [
            { name: 'firstName', label: 'الاسم', type: 'text', required: true },
            { name: 'lastName', label: 'اللقب', type: 'text', required: true },
            { 
                name: 'specialty', 
                label: 'التخصص', 
                type: 'select', 
                required: true,
                options: [
                    { value: 'معلم فصل', label: 'معلم فصل' },
                    { value: 'لغة عربية', label: 'لغة عربية' },
                    { value: 'لغة فرنسية', label: 'لغة فرنسية' },
                    { value: 'لغة إنجليزية', label: 'لغة إنجليزية' },
                    { value: 'رياضيات', label: 'رياضيات' },
                    { value: 'علوم', label: 'علوم' },
                    { value: 'تربية إسلامية', label: 'تربية إسلامية' },
                    { value: 'تربية بدنية', label: 'تربية بدنية' },
                    { value: 'تربية فنية', label: 'تربية فنية' },
                    { value: 'مشرف تربوي', label: 'مشرف تربوي' },
                    { value: 'أخرى', label: 'أخرى' }
                ]
            },
            { 
                name: 'rank', 
                label: 'الرتبة', 
                type: 'select', 
                required: true,
                options: [
                    { value: 'أستاذ مساعد', label: 'أستاذ مساعد' },
                    { value: 'أستاذ', label: 'أستاذ' },
                    { value: 'أستاذ رئيسي', label: 'أستاذ رئيسي' },
                    { value: 'أستاذ مكون', label: 'أستاذ مكون' },
                    { value: 'مشرف تربوي', label: 'مشرف تربوي' },
                    { value: 'أخرى', label: 'أخرى' }
                ]
            },
            { name: 'hireDate', label: 'تاريخ التوظيف', type: 'date', required: true },
            { name: 'phone', label: 'رقم الهاتف', type: 'tel' },
            { name: 'email', label: 'البريد الإلكتروني', type: 'email' },
            { name: 'address', label: 'العنوان', type: 'text', size: 12 },
            { name: 'notes', label: 'ملاحظات', type: 'textarea', size: 12 }
        ];
        
        // إنشاء النموذج
        const form = UI.createForm({
            fields: fields,
            values: teacher,
            submitText: isEditing ? 'تحديث البيانات' : 'إضافة أستاذ',
            onSubmit: (formData) => {
                if (isEditing) {
                    this.updateTeacher(teacherId, formData);
                } else {
                    this.addTeacher(formData);
                }
                modal.hide();
            },
            onCancel: () => modal.hide()
        });
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'teacher-modal',
            title: isEditing ? 'تعديل بيانات أستاذ' : 'إضافة أستاذ جديد',
            content: form,
            size: 'lg'
        });
        
        // عرض المربع الحواري
        modal.show();
    },

    // إضافة أستاذ جديد
    addTeacher: function(teacherData) {
        const newTeacher = DataManager.addTeacher(teacherData);
        
        if (newTeacher) {
            // تحديث عرض الأساتذة
            this.searchTeachers('', { specialty: 'all' });
            
            // عرض إشعار نجاح
            UI.showNotification(`تم إضافة الأستاذ ${newTeacher.firstName} ${newTeacher.lastName} بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء إضافة الأستاذ', 'error');
        }
    },

    // تحديث بيانات أستاذ
    updateTeacher: function(teacherId, updatedData) {
        const updatedTeacher = DataManager.updateTeacher(teacherId, updatedData);
        
        if (updatedTeacher) {
            // تحديث عرض الأساتذة
            this.searchTeachers('', { specialty: 'all' });
            
            // عرض إشعار نجاح
            UI.showNotification(`تم تحديث بيانات الأستاذ ${updatedTeacher.firstName} ${updatedTeacher.lastName} بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء تحديث بيانات الأستاذ', 'error');
        }
    },

    // حذف أستاذ
    deleteTeacher: function(teacherId) {
        const teacher = DataManager.getTeacherById(teacherId);
        
        if (!teacher) {
            UI.showNotification('لم يتم العثور على الأستاذ', 'error');
            return;
        }
        
        // طلب تأكيد الحذف
        if (confirm(`هل أنت متأكد من رغبتك في حذف الأستاذ ${teacher.firstName} ${teacher.lastName}؟`)) {
            const result = DataManager.deleteTeacher(teacherId);
            
            if (result) {
                // تحديث عرض الأساتذة
                this.searchTeachers('', { specialty: 'all' });
                
                // عرض إشعار نجاح
                UI.showNotification(`تم حذف الأستاذ ${teacher.firstName} ${teacher.lastName} بنجاح`, 'success');
            } else {
                UI.showNotification('حدث خطأ أثناء حذف الأستاذ', 'error');
            }
        }
    },

    // عرض تفاصيل أستاذ
    viewTeacher: function(teacherId) {
        const teacher = DataManager.getTeacherById(teacherId);
        
        if (!teacher) {
            UI.showNotification('لم يتم العثور على الأستاذ', 'error');
            return;
        }
        
        // إنشاء محتوى العرض
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>الاسم:</strong> ${teacher.firstName}</p>
                    <p><strong>اللقب:</strong> ${teacher.lastName}</p>
                    <p><strong>التخصص:</strong> ${teacher.specialty}</p>
                    <p><strong>الرتبة:</strong> ${teacher.rank}</p>
                    <p><strong>تاريخ التوظيف:</strong> ${UI.formatDate(teacher.hireDate)}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>رقم الهاتف:</strong> ${teacher.phone || 'غير متوفر'}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${teacher.email || 'غير متوفر'}</p>
                    <p><strong>العنوان:</strong> ${teacher.address || 'غير متوفر'}</p>
                    <p><strong>ملاحظات:</strong> ${teacher.notes || 'لا توجد ملاحظات'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12 text-start">
                    <button id="print-certificate-btn" class="btn btn-secondary">
                        <i class="fas fa-file-alt"></i> طباعة شهادة عمل
                    </button>
                </div>
            </div>
        `;
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'view-teacher-modal',
            title: `بيانات الأستاذ: ${teacher.firstName} ${teacher.lastName}`,
            content: content,
            size: 'lg'
        });
        
        // إضافة مستمع حدث لزر طباعة شهادة العمل
        setTimeout(() => {
            document.getElementById('print-certificate-btn').addEventListener('click', () => {
                this.printWorkCertificate(teacherId);
            });
        }, 0);
        
        // عرض المربع الحواري
        modal.show();
    },

    // تعديل بيانات أستاذ
    editTeacher: function(teacherId) {
        this.showTeacherForm(teacherId);
    },

    // طباعة شهادة عمل
    printWorkCertificate: function(teacherId) {
        const teacher = DataManager.getTeacherById(teacherId);
        
        if (!teacher) {
            UI.showNotification('لم يتم العثور على الأستاذ', 'error');
            return;
        }
        
        // حساب مدة الخدمة
        const hireDate = new Date(teacher.hireDate);
        const currentDate = new Date();
        const yearsOfService = currentDate.getFullYear() - hireDate.getFullYear();
        const monthsOfService = currentDate.getMonth() - hireDate.getMonth();
        let serviceText = '';
        
        if (yearsOfService > 0) {
            serviceText += `${yearsOfService} سنة`;
            if (monthsOfService > 0) {
                serviceText += ` و ${monthsOfService} أشهر`;
            }
        } else if (monthsOfService > 0) {
            serviceText += `${monthsOfService} أشهر`;
        } else {
            serviceText = 'أقل من شهر';
        }
        
        // إنشاء محتوى الشهادة
        const certificateContent = document.createElement('div');
        certificateContent.className = 'certificate-container';
        certificateContent.innerHTML = `
            <div class="certificate print-document">
                <div class="official-header">
                    <div>
                        <img src="img/algeria-logo.png" alt="شعار الجزائر" class="official-logo" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><rect width=\'80\' height=\'80\' fill=\'%23f5f5f5\'/><text x=\'10\' y=\'45\' font-family=\'Arial\' font-size=\'12\' fill=\'%23333\'>شعار الجزائر</text></svg>'">
                    </div>
                    <div class="official-title">
                        <h3>الجمهورية الجزائرية الديمقراطية الشعبية</h3>
                        <h4>وزارة التربية الوطنية</h4>
                        <h5>مديرية التربية لولاية ${App.state.schoolInfo.address}</h5>
                        <h5>${App.state.schoolInfo.name}</h5>
                    </div>
                    <div>
                        <img src="${App.state.schoolInfo.logo || 'img/default-logo.png'}" alt="شعار المدرسة" class="official-logo" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><rect width=\'80\' height=\'80\' fill=\'%23f5f5f5\'/><text x=\'10\' y=\'45\' font-family=\'Arial\' font-size=\'12\' fill=\'%23333\'>شعار المدرسة</text></svg>'">
                    </div>
                </div>
                
                <div class="certificate-title">شهادة عمل</div>
                
                <div class="certificate-content">
                    <p>يشهد السيد(ة) مدير(ة) ${App.state.schoolInfo.name} أن السيد(ة):</p>
                    <p><strong>الاسم:</strong> ${teacher.firstName}</p>
                    <p><strong>اللقب:</strong> ${teacher.lastName}</p>
                    <p><strong>الرتبة:</strong> ${teacher.rank}</p>
                    <p><strong>التخصص:</strong> ${teacher.specialty}</p>
                    <p><strong>تاريخ التوظيف:</strong> ${UI.formatDate(teacher.hireDate)}</p>
                    <p><strong>مدة الخدمة:</strong> ${serviceText}</p>
                    <p>يعمل حاليًا بالمدرسة المذكورة أعلاه.</p>
                    <p>سلمت هذه الشهادة للمعني(ة) بالأمر بناءً على طلبه(ا) لاستعمالها فيما يسمح به القانون.</p>
                </div>
                
                <div class="certificate-footer">
                    <div class="certificate-date">
                        <p>حرر بتاريخ: ${new Date().toLocaleDateString('ar-DZ')}</p>
                    </div>
                    <div class="certificate-signature">
                        <p>إمضاء المدير(ة)</p>
                        <p>${App.state.schoolInfo.principal}</p>
                    </div>
                </div>
                
                <div class="certificate-stamp">
                    <p>ختم المدرسة</p>
                </div>
            </div>
            
            <div class="text-center mt-4 no-print">
                <button id="print-certificate-now" class="btn btn-primary">
                    <i class="fas fa-print"></i> طباعة الشهادة
                </button>
            </div>
        `;
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'certificate-modal',
            title: `شهادة عمل: ${teacher.firstName} ${teacher.lastName}`,
            content: certificateContent,
            size: 'lg'
        });
        
        // إضافة مستمع حدث لزر الطباعة
        setTimeout(() => {
            document.getElementById('print-certificate-now').addEventListener('click', function() {
                window.print();
            });
        }, 0);
        
        // عرض المربع الحواري
        modal.show();
    }
};