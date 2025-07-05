/**
 * منصة إدارة المدرسة الابتدائية
 * مدير التلاميذ - مسؤول عن إدارة بيانات التلاميذ والشهادات المدرسية
 */

const StudentsManager = {
    // تهيئة مدير التلاميذ
    init: function() {
        console.log('تهيئة مدير التلاميذ...');
    },

    // تحميل صفحة التلاميذ
    loadStudentsPage: function() {
        const studentsPage = document.getElementById('students-page');
        
        // إنشاء محتوى الصفحة
        studentsPage.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h4>قائمة التلاميذ</h4>
                </div>
                <div class="col-md-6 text-start">
                    <button id="add-student-btn" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> إضافة تلميذ جديد
                    </button>
                </div>
            </div>
            
            <div id="search-filter-container"></div>
            
            <div id="students-table-container"></div>
        `;
        
        // إضافة مستمع حدث لزر إضافة تلميذ
        document.getElementById('add-student-btn').addEventListener('click', () => {
            this.showStudentForm();
        });
        
        // إنشاء حقل البحث والتصفية
        const searchFilterContainer = document.getElementById('search-filter-container');
        const searchFilter = UI.createSearchFilter({
            onSearch: (query, filters) => {
                this.searchStudents(query, filters);
            },
            filters: [
                { name: 'class', label: 'الصف', size: 3 },
                { name: 'gender', label: 'الجنس', size: 3 }
            ],
            filterOptions: {
                class: [
                    { value: 'السنة الأولى', label: 'السنة الأولى' },
                    { value: 'السنة الثانية', label: 'السنة الثانية' },
                    { value: 'السنة الثالثة', label: 'السنة الثالثة' },
                    { value: 'السنة الرابعة', label: 'السنة الرابعة' },
                    { value: 'السنة الخامسة', label: 'السنة الخامسة' }
                ],
                gender: [
                    { value: 'ذكر', label: 'ذكر' },
                    { value: 'أنثى', label: 'أنثى' }
                ]
            }
        });
        searchFilterContainer.appendChild(searchFilter);
        
        // عرض جميع التلاميذ
        this.searchStudents('', { class: 'all', gender: 'all' });
    },

    // البحث عن التلاميذ وعرضهم
    searchStudents: function(query, filters) {
        const students = DataManager.searchStudents(query, filters);
        this.displayStudents(students);
    },

    // عرض قائمة التلاميذ
    displayStudents: function(students) {
        const tableContainer = document.getElementById('students-table-container');
        
        // تعريف أعمدة الجدول
        const columns = [
            { field: 'firstName', label: 'الاسم' },
            { field: 'lastName', label: 'اللقب' },
            { field: 'birthDate', label: 'تاريخ الميلاد', formatter: (value) => UI.formatDate(value) },
            { field: 'gender', label: 'الجنس' },
            { field: 'class', label: 'الصف' },
            { field: 'parentName', label: 'اسم الولي' }
        ];
        
        // إنشاء الجدول
        const table = UI.createDataTable({
            columns: columns,
            data: students,
            actions: {
                view: true,
                edit: true,
                delete: true,
                custom: [
                    {
                        btnClass: 'btn-secondary',
                        className: 'print-certificate-btn',
                        icon: 'file-alt',
                        title: 'طباعة الشهادة المدرسية',
                        onClick: (id) => this.printSchoolCertificate(id)
                    },
                    {
                        btnClass: 'btn-success',
                        className: 'add-to-cafeteria-btn',
                        icon: 'utensils',
                        title: 'إضافة للمطعم',
                        onClick: (id) => this.addToCafeteria(id)
                    }
                ]
            },
            onView: (id) => this.viewStudent(id),
            onEdit: (id) => this.editStudent(id),
            onDelete: (id) => this.deleteStudent(id)
        });
        
        // إضافة الجدول إلى الحاوية
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    },

    // عرض نموذج إضافة/تعديل تلميذ
    showStudentForm: function(studentId = null) {
        // تحديد ما إذا كنا نقوم بإضافة أو تعديل
        const isEditing = studentId !== null;
        const student = isEditing ? DataManager.getStudentById(studentId) : null;
        
        // تعريف حقول النموذج
        const fields = [
            { name: 'firstName', label: 'الاسم', type: 'text', required: true },
            { name: 'lastName', label: 'اللقب', type: 'text', required: true },
            { name: 'birthDate', label: 'تاريخ الميلاد', type: 'date', required: true },
            { 
                name: 'gender', 
                label: 'الجنس', 
                type: 'radio', 
                required: true,
                options: [
                    { value: 'ذكر', label: 'ذكر' },
                    { value: 'أنثى', label: 'أنثى' }
                ]
            },
            { 
                name: 'class', 
                label: 'الصف', 
                type: 'select', 
                required: true,
                options: [
                    { value: 'السنة الأولى', label: 'السنة الأولى' },
                    { value: 'السنة الثانية', label: 'السنة الثانية' },
                    { value: 'السنة الثالثة', label: 'السنة الثالثة' },
                    { value: 'السنة الرابعة', label: 'السنة الرابعة' },
                    { value: 'السنة الخامسة', label: 'السنة الخامسة' }
                ]
            },
            { name: 'parentName', label: 'اسم الولي', type: 'text', required: true },
            { name: 'parentPhone', label: 'هاتف الولي', type: 'tel' },
            { name: 'address', label: 'العنوان', type: 'text', size: 12 },
            { name: 'notes', label: 'ملاحظات', type: 'textarea', size: 12 }
        ];
        
        // إنشاء النموذج
        const form = UI.createForm({
            fields: fields,
            values: student,
            submitText: isEditing ? 'تحديث البيانات' : 'إضافة تلميذ',
            onSubmit: (formData) => {
                if (isEditing) {
                    this.updateStudent(studentId, formData);
                } else {
                    this.addStudent(formData);
                }
                modal.hide();
            },
            onCancel: () => modal.hide()
        });
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'student-modal',
            title: isEditing ? 'تعديل بيانات تلميذ' : 'إضافة تلميذ جديد',
            content: form,
            size: 'lg'
        });
        
        // عرض المربع الحواري
        modal.show();
    },

    // إضافة تلميذ جديد
    addStudent: function(studentData) {
        const newStudent = DataManager.addStudent(studentData);
        
        if (newStudent) {
            // تحديث عرض التلاميذ
            this.searchStudents('', { class: 'all', gender: 'all' });
            
            // عرض إشعار نجاح
            UI.showNotification(`تم إضافة التلميذ ${newStudent.firstName} ${newStudent.lastName} بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء إضافة التلميذ', 'error');
        }
    },

    // تحديث بيانات تلميذ
    updateStudent: function(studentId, updatedData) {
        const updatedStudent = DataManager.updateStudent(studentId, updatedData);
        
        if (updatedStudent) {
            // تحديث عرض التلاميذ
            this.searchStudents('', { class: 'all', gender: 'all' });
            
            // عرض إشعار نجاح
            UI.showNotification(`تم تحديث بيانات التلميذ ${updatedStudent.firstName} ${updatedStudent.lastName} بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء تحديث بيانات التلميذ', 'error');
        }
    },

    // حذف تلميذ
    deleteStudent: function(studentId) {
        const student = DataManager.getStudentById(studentId);
        
        if (!student) {
            UI.showNotification('لم يتم العثور على التلميذ', 'error');
            return;
        }
        
        // طلب تأكيد الحذف
        if (confirm(`هل أنت متأكد من رغبتك في حذف التلميذ ${student.firstName} ${student.lastName}؟`)) {
            const result = DataManager.deleteStudent(studentId);
            
            if (result) {
                // تحديث عرض التلاميذ
                this.searchStudents('', { class: 'all', gender: 'all' });
                
                // عرض إشعار نجاح
                UI.showNotification(`تم حذف التلميذ ${student.firstName} ${student.lastName} بنجاح`, 'success');
            } else {
                UI.showNotification('حدث خطأ أثناء حذف التلميذ', 'error');
            }
        }
    },

    // عرض تفاصيل تلميذ
    viewStudent: function(studentId) {
        const student = DataManager.getStudentById(studentId);
        
        if (!student) {
            UI.showNotification('لم يتم العثور على التلميذ', 'error');
            return;
        }
        
        // إنشاء محتوى العرض
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>الاسم:</strong> ${student.firstName}</p>
                    <p><strong>اللقب:</strong> ${student.lastName}</p>
                    <p><strong>تاريخ الميلاد:</strong> ${UI.formatDate(student.birthDate)}</p>
                    <p><strong>الجنس:</strong> ${student.gender}</p>
                    <p><strong>الصف:</strong> ${student.class}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>اسم الولي:</strong> ${student.parentName}</p>
                    <p><strong>هاتف الولي:</strong> ${student.parentPhone || 'غير متوفر'}</p>
                    <p><strong>العنوان:</strong> ${student.address || 'غير متوفر'}</p>
                    <p><strong>ملاحظات:</strong> ${student.notes || 'لا توجد ملاحظات'}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12 text-start">
                    <button id="print-certificate-btn" class="btn btn-secondary">
                        <i class="fas fa-file-alt"></i> طباعة الشهادة المدرسية
                    </button>
                    <button id="add-to-cafeteria-btn" class="btn btn-success ms-2">
                        <i class="fas fa-utensils"></i> إضافة للمطعم
                    </button>
                </div>
            </div>
        `;
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'view-student-modal',
            title: `بيانات التلميذ: ${student.firstName} ${student.lastName}`,
            content: content,
            size: 'lg'
        });
        
        // إضافة مستمعي الأحداث للأزرار
        setTimeout(() => {
            document.getElementById('print-certificate-btn').addEventListener('click', () => {
                this.printSchoolCertificate(studentId);
            });
            
            document.getElementById('add-to-cafeteria-btn').addEventListener('click', () => {
                this.addToCafeteria(studentId);
                modal.hide();
            });
        }, 0);
        
        // عرض المربع الحواري
        modal.show();
    },

    // تعديل بيانات تلميذ
    editStudent: function(studentId) {
        this.showStudentForm(studentId);
    },

    // طباعة الشهادة المدرسية
    printSchoolCertificate: function(studentId) {
        const student = DataManager.getStudentById(studentId);
        
        if (!student) {
            UI.showNotification('لم يتم العثور على التلميذ', 'error');
            return;
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
                
                <div class="certificate-title">شهادة مدرسية</div>
                
                <div class="certificate-content">
                    <p>يشهد السيد(ة) مدير(ة) ${App.state.schoolInfo.name} أن التلميذ(ة):</p>
                    <p><strong>الاسم:</strong> ${student.firstName}</p>
                    <p><strong>اللقب:</strong> ${student.lastName}</p>
                    <p><strong>تاريخ الميلاد:</strong> ${UI.formatDate(student.birthDate)}</p>
                    <p><strong>مسجل(ة) بالمدرسة للسنة الدراسية:</strong> ${new Date().getFullYear()} / ${new Date().getFullYear() + 1}</p>
                    <p><strong>القسم:</strong> ${student.class}</p>
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
            title: `الشهادة المدرسية: ${student.firstName} ${student.lastName}`,
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
    },

    // إضافة تلميذ للمطعم
    addToCafeteria: function(studentId) {
        const student = DataManager.getStudentById(studentId);
        
        if (!student) {
            UI.showNotification('لم يتم العثور على التلميذ', 'error');
            return;
        }
        
        // إضافة التلميذ كمستفيد من المطعم
        const result = DataManager.addCafeteriaUser(studentId);
        
        if (result) {
            UI.showNotification(`تم إضافة التلميذ ${student.firstName} ${student.lastName} كمستفيد من المطعم بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء إضافة التلميذ للمطعم أو التلميذ مسجل بالفعل', 'warning');
        }
    }
};