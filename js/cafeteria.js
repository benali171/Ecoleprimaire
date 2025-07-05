/**
 * منصة إدارة المدرسة الابتدائية
 * مدير المطعم المدرسي - مسؤول عن إدارة المطعم وعمال المطعم
 */

// التحقق من وجود الكائنات المطلوبة
if (typeof DataManager === 'undefined') {
    console.error('خطأ: كائن DataManager غير معرف. تأكد من تضمين ملف data-manager.js');
}

if (typeof UI === 'undefined') {
    console.error('خطأ: كائن UI غير معرف. تأكد من تضمين ملف ui.js');
}

if (typeof App === 'undefined') {
    console.error('خطأ: كائن App غير معرف. تأكد من تضمين ملف app.js');
}

const CafeteriaManager = {
    // تهيئة مدير المطعم
    init: function() {
        console.log('تهيئة مدير المطعم المدرسي...');
    },

    // تحميل صفحة المطعم المدرسي
    loadCafeteriaPage: function() {
        const cafeteriaPage = document.getElementById('cafeteria-page');
        
        // إنشاء محتوى الصفحة
        cafeteriaPage.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h4>إدارة المطعم المدرسي</h4>
                </div>
                <div class="col-md-6 text-start">
                    <button id="add-cafeteria-user-btn" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> إضافة مستفيد جديد
                    </button>
                    <button id="add-expense-btn" class="btn btn-warning ms-2">
                        <i class="fas fa-money-bill"></i> تسجيل مصروف
                    </button>
                    <button id="add-income-btn" class="btn btn-success ms-2">
                        <i class="fas fa-money-bill-wave"></i> تسجيل مدخول
                    </button>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">ملخص المطعم</h5>
                            <div class="mt-3">
                                <p><strong>عدد المستفيدين:</strong> <span id="cafeteria-users-count">0</span></p>
                                <p><strong>إجمالي المصاريف:</strong> <span id="cafeteria-expenses-total">0 دج</span></p>
                                <p><strong>إجمالي المدخولات:</strong> <span id="cafeteria-income-total">0 دج</span></p>
                                <p><strong>الرصيد الحالي:</strong> <span id="cafeteria-balance">0 دج</span></p>
                            </div>
                            <div class="mt-3">
                                <button id="print-financial-report-btn" class="btn btn-info w-100">
                                    <i class="fas fa-file-invoice"></i> طباعة التقرير المالي
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <ul class="nav nav-tabs" id="cafeteria-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="users-tab" data-bs-toggle="tab" data-bs-target="#users-tab-pane" type="button" role="tab" aria-controls="users-tab-pane" aria-selected="true">المستفيدون</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="expenses-tab" data-bs-toggle="tab" data-bs-target="#expenses-tab-pane" type="button" role="tab" aria-controls="expenses-tab-pane" aria-selected="false">المصاريف</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="income-tab" data-bs-toggle="tab" data-bs-target="#income-tab-pane" type="button" role="tab" aria-controls="income-tab-pane" aria-selected="false">المدخولات</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="cafeteria-tabs-content">
                        <div class="tab-pane fade show active" id="users-tab-pane" role="tabpanel" aria-labelledby="users-tab" tabindex="0">
                            <div class="card border-top-0">
                                <div class="card-body">
                                    <div id="cafeteria-users-table-container"></div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="expenses-tab-pane" role="tabpanel" aria-labelledby="expenses-tab" tabindex="0">
                            <div class="card border-top-0">
                                <div class="card-body">
                                    <div id="cafeteria-expenses-table-container"></div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="income-tab-pane" role="tabpanel" aria-labelledby="income-tab" tabindex="0">
                            <div class="card border-top-0">
                                <div class="card-body">
                                    <div id="cafeteria-income-table-container"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة مستمعي الأحداث للأزرار
        document.getElementById('add-cafeteria-user-btn').addEventListener('click', () => {
            this.showAddUserForm();
        });
        
        document.getElementById('add-expense-btn').addEventListener('click', () => {
            this.showAddExpenseForm();
        });
        
        document.getElementById('add-income-btn').addEventListener('click', () => {
            this.showAddIncomeForm();
        });
        
        document.getElementById('print-financial-report-btn').addEventListener('click', () => {
            this.printFinancialReport();
        });
        
        // تحميل البيانات
        this.loadCafeteriaData();
    },

    // تحميل صفحة عمال المطعم
    loadWorkersPage: function() {
        const workersPage = document.getElementById('cafeteria-workers-page');
        
        // إنشاء محتوى الصفحة
        workersPage.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h4>عمال المطعم المدرسي</h4>
                </div>
                <div class="col-md-6 text-start">
                    <button id="add-worker-btn" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> إضافة عامل جديد
                    </button>
                </div>
            </div>
            
            <div id="workers-table-container"></div>
        `;
        
        // إضافة مستمع حدث لزر إضافة عامل
        document.getElementById('add-worker-btn').addEventListener('click', () => {
            this.showWorkerForm();
        });
        
        // عرض جميع العمال
        this.displayWorkers();
    },

    // تحميل بيانات المطعم
    loadCafeteriaData: function() {
        try {
            // التحقق من وجود العناصر قبل تحديثها
            const usersCountElement = document.getElementById('cafeteria-users-count');
            const expensesTotalElement = document.getElementById('cafeteria-expenses-total');
            const incomeTotalElement = document.getElementById('cafeteria-income-total');
            const balanceElement = document.getElementById('cafeteria-balance');
            
            if (usersCountElement) usersCountElement.textContent = DataManager.getCafeteriaUsersCount();
            if (expensesTotalElement) expensesTotalElement.textContent = UI.formatCurrency(DataManager.getTotalCafeteriaExpenses());
            if (incomeTotalElement) incomeTotalElement.textContent = UI.formatCurrency(DataManager.getTotalCafeteriaIncome());
            if (balanceElement) balanceElement.textContent = UI.formatCurrency(DataManager.getCafeteriaBalance());
            
            // تحميل جداول البيانات
            this.displayCafeteriaUsers();
            this.displayCafeteriaExpenses();
            this.displayCafeteriaIncome();
        } catch (error) {
            console.error('خطأ في تحميل بيانات المطعم:', error);
            UI.showNotification('حدث خطأ أثناء تحميل بيانات المطعم', 'error');
        }
    },

    // عرض المستفيدين من المطعم
    displayCafeteriaUsers: function() {
        const tableContainer = document.getElementById('cafeteria-users-table-container');
        const cafeteriaUsers = DataManager.getAllCafeteriaUsers();
        
        // تعريف أعمدة الجدول
        const columns = [
            { field: 'student.firstName', label: 'الاسم' },
            { field: 'student.lastName', label: 'اللقب' },
            { field: 'student.class', label: 'الصف' },
            { field: 'startDate', label: 'تاريخ التسجيل', formatter: (value) => UI.formatDate(value) }
        ];
        
        // إنشاء الجدول
        const table = UI.createDataTable({
            columns: columns,
            data: cafeteriaUsers,
            actions: {
                delete: true
            },
            onDelete: (id) => this.removeCafeteriaUser(id)
        });
        
        // إضافة الجدول إلى الحاوية
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    },

    // عرض مصاريف المطعم
    displayCafeteriaExpenses: function() {
        const tableContainer = document.getElementById('cafeteria-expenses-table-container');
        const expenses = DataManager.getAllCafeteriaExpenses();
        
        // تعريف أعمدة الجدول
        const columns = [
            { field: 'date', label: 'التاريخ', formatter: (value) => UI.formatDate(value) },
            { field: 'description', label: 'الوصف' },
            { field: 'amount', label: 'المبلغ', formatter: (value) => UI.formatCurrency(value) },
            { field: 'category', label: 'الفئة' }
        ];
        
        // إنشاء الجدول
        const table = UI.createDataTable({
            columns: columns,
            data: expenses,
            actions: {
                delete: true
            },
            onDelete: (id) => this.deleteExpense(id)
        });
        
        // إضافة الجدول إلى الحاوية
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    },

    // عرض مدخولات المطعم
    displayCafeteriaIncome: function() {
        const tableContainer = document.getElementById('cafeteria-income-table-container');
        const income = DataManager.getAllCafeteriaIncome();
        
        // تعريف أعمدة الجدول
        const columns = [
            { field: 'date', label: 'التاريخ', formatter: (value) => UI.formatDate(value) },
            { field: 'description', label: 'الوصف' },
            { field: 'amount', label: 'المبلغ', formatter: (value) => UI.formatCurrency(value) },
            { field: 'source', label: 'المصدر' }
        ];
        
        // إنشاء الجدول
        const table = UI.createDataTable({
            columns: columns,
            data: income,
            actions: {
                delete: true
            },
            onDelete: (id) => this.deleteIncome(id)
        });
        
        // إضافة الجدول إلى الحاوية
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    },

    // عرض عمال المطعم
    displayWorkers: function() {
        const tableContainer = document.getElementById('workers-table-container');
        const workers = DataManager.getAllCafeteriaWorkers();
        
        // تعريف أعمدة الجدول
        const columns = [
            { field: 'firstName', label: 'الاسم' },
            { field: 'lastName', label: 'اللقب' },
            { field: 'position', label: 'المنصب' },
            { field: 'hireDate', label: 'تاريخ التوظيف', formatter: (value) => UI.formatDate(value) },
            { field: 'phone', label: 'رقم الهاتف' }
        ];
        
        // إنشاء الجدول
        const table = UI.createDataTable({
            columns: columns,
            data: workers,
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
                        onClick: (id) => this.printWorkerCertificate(id)
                    }
                ]
            },
            onView: (id) => this.viewWorker(id),
            onEdit: (id) => this.editWorker(id),
            onDelete: (id) => this.deleteWorker(id)
        });
        
        // إضافة الجدول إلى الحاوية
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    },

    // عرض نموذج إضافة مستفيد للمطعم
    showAddUserForm: function() {
        // الحصول على قائمة التلاميذ غير المسجلين في المطعم
        const allStudents = DataManager.getAllStudents();
        const cafeteriaUsers = DataManager.getAllCafeteriaUsers();
        const cafeteriaUserIds = cafeteriaUsers.map(user => user.studentId);
        
        const availableStudents = allStudents.filter(student => !cafeteriaUserIds.includes(student.id));
        
        if (availableStudents.length === 0) {
            UI.showNotification('جميع التلاميذ مسجلون بالفعل في المطعم', 'info');
            return;
        }
        
        // تحويل قائمة التلاميذ إلى خيارات للقائمة المنسدلة
        const studentOptions = availableStudents.map(student => ({
            value: student.id,
            label: `${student.firstName} ${student.lastName} - ${student.class}`
        }));
        
        // تعريف حقول النموذج
        const fields = [
            { 
                name: 'studentId', 
                label: 'اختر التلميذ', 
                type: 'select', 
                required: true,
                options: studentOptions
            }
        ];
        
        // إنشاء النموذج
        const form = UI.createForm({
            fields: fields,
            submitText: 'إضافة للمطعم',
            onSubmit: (formData) => {
                this.addCafeteriaUser(formData.studentId);
                modal.hide();
            },
            onCancel: () => modal.hide()
        });
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'add-cafeteria-user-modal',
            title: 'إضافة مستفيد جديد للمطعم',
            content: form
        });
        
        // عرض المربع الحواري
        modal.show();
    },

    // إضافة مستفيد للمطعم
    addCafeteriaUser: function(studentId) {
        const student = DataManager.getStudentById(studentId);
        
        if (!student) {
            UI.showNotification('لم يتم العثور على التلميذ', 'error');
            return;
        }
        
        // إضافة التلميذ كمستفيد من المطعم
        const result = DataManager.addCafeteriaUser(studentId);
        
        if (result) {
            // تحديث عرض المستفيدين
            this.loadCafeteriaData();
            
            // عرض إشعار نجاح
            UI.showNotification(`تم إضافة التلميذ ${student.firstName} ${student.lastName} كمستفيد من المطعم بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء إضافة التلميذ للمطعم أو التلميذ مسجل بالفعل', 'warning');
        }
    },

    // إلغاء تسجيل مستفيد من المطعم
    removeCafeteriaUser: function(userId) {
        const cafeteriaUser = DataManager.getAllCafeteriaUsers().find(user => user.id === userId);
        
        if (!cafeteriaUser || !cafeteriaUser.student) {
            UI.showNotification('لم يتم العثور على المستفيد', 'error');
            return;
        }
        
        // طلب تأكيد الإلغاء
        if (confirm(`هل أنت متأكد من رغبتك في إلغاء استفادة التلميذ ${cafeteriaUser.student.firstName} ${cafeteriaUser.student.lastName} من المطعم؟`)) {
            const result = DataManager.removeCafeteriaUser(cafeteriaUser.studentId);
            
            if (result) {
                // تحديث عرض المستفيدين
                this.loadCafeteriaData();
                
                // عرض إشعار نجاح
                UI.showNotification(`تم إلغاء استفادة التلميذ ${cafeteriaUser.student.firstName} ${cafeteriaUser.student.lastName} من المطعم بنجاح`, 'success');
            } else {
                UI.showNotification('حدث خطأ أثناء إلغاء استفادة التلميذ من المطعم', 'error');
            }
        }
    },

    // عرض نموذج إضافة مصروف
    showAddExpenseForm: function() {
        // تعريف حقول النموذج
        const fields = [
            { name: 'description', label: 'وصف المصروف', type: 'text', required: true },
            { name: 'amount', label: 'المبلغ (دج)', type: 'number', required: true },
            { name: 'date', label: 'التاريخ', type: 'date', required: true },
            { 
                name: 'category', 
                label: 'الفئة', 
                type: 'select', 
                required: true,
                options: [
                    { value: 'مواد غذائية', label: 'مواد غذائية' },
                    { value: 'أدوات مطبخ', label: 'أدوات مطبخ' },
                    { value: 'صيانة', label: 'صيانة' },
                    { value: 'أخرى', label: 'أخرى' }
                ]
            },
            { name: 'notes', label: 'ملاحظات', type: 'textarea' }
        ];
        
        // تعيين التاريخ الحالي كقيمة افتراضية
        const today = new Date().toISOString().split('T')[0];
        const values = { date: today };
        
        // إنشاء النموذج
        const form = UI.createForm({
            fields: fields,
            values: values,
            submitText: 'تسجيل المصروف',
            onSubmit: (formData) => {
                this.addExpense(formData);
                modal.hide();
            },
            onCancel: () => modal.hide()
        });
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'add-expense-modal',
            title: 'تسجيل مصروف جديد',
            content: form
        });
        
        // عرض المربع الحواري
        modal.show();
    },

    // إضافة مصروف
    addExpense: function(expenseData) {
        const newExpense = DataManager.addCafeteriaExpense(expenseData);
        
        if (newExpense) {
            // تحديث عرض المصاريف
            this.loadCafeteriaData();
            
            // عرض إشعار نجاح
            UI.showNotification(`تم تسجيل مصروف جديد بقيمة ${UI.formatCurrency(newExpense.amount)} بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء تسجيل المصروف', 'error');
        }
    },


    // حذف مصروف
    deleteExpense: function(expenseId) {
        try {
            if (!expenseId) {
                UI.showNotification('معرف المصروف غير صالح', 'error');
                return;
            }
            
            const expenses = DataManager.getAllCafeteriaExpenses();
            const expense = expenses.find(exp => exp.id === expenseId);
            
            if (!expense) {
                UI.showNotification('لم يتم العثور على المصروف', 'error');
                return;
            }
            
            // طلب تأكيد الحذف
            if (confirm(`هل أنت متأكد من رغبتك في حذف المصروف بقيمة ${UI.formatCurrency(expense.amount)}؟`)) {
                // حذف المصروف من المصفوفة
                const index = DataManager.data.cafeteriaExpenses.findIndex(exp => exp.id === expenseId);
                if (index !== -1) {
                    DataManager.data.cafeteriaExpenses.splice(index, 1);
                    
                    try {
                        localStorage.setItem('cafeteriaExpenses', JSON.stringify(DataManager.data.cafeteriaExpenses));
                    } catch (storageError) {
                        console.error('خطأ في حفظ البيانات:', storageError);
                        UI.showNotification('حدث خطأ أثناء حفظ البيانات', 'warning');
                    }
                    
                    // تحديث عرض المصاريف
                    this.loadCafeteriaData();
                    
                    // إضافة نشاط
                    App.addActivity('حذف مصروف', `تم حذف مصروف بقيمة ${UI.formatCurrency(expense.amount)}`);
                    
                    // عرض إشعار نجاح
                    UI.showNotification(`تم حذف المصروف بنجاح`, 'success');
                } else {
                    UI.showNotification('حدث خطأ أثناء حذف المصروف', 'error');
                }
            }
        } catch (error) {
            console.error('خطأ في حذف المصروف:', error);
            UI.showNotification('حدث خطأ غير متوقع أثناء حذف المصروف', 'error');
        }
    },

    // عرض نموذج إضافة مدخول
    showAddIncomeForm: function() {
        // تعريف حقول النموذج
        const fields = [
            { name: 'description', label: 'وصف المدخول', type: 'text', required: true },
            { name: 'amount', label: 'المبلغ (دج)', type: 'number', required: true },
            { name: 'date', label: 'التاريخ', type: 'date', required: true },
            { 
                name: 'source', 
                label: 'المصدر', 
                type: 'select', 
                required: true,
                options: [
                    { value: 'ميزانية المدرسة', label: 'ميزانية المدرسة' },
                    { value: 'دعم حكومي', label: 'دعم حكومي' },
                    { value: 'تبرعات', label: 'تبرعات' },
                    { value: 'أخرى', label: 'أخرى' }
                ]
            },
            { name: 'notes', label: 'ملاحظات', type: 'textarea' }
        ];
        
        // تعيين التاريخ الحالي كقيمة افتراضية
        const today = new Date().toISOString().split('T')[0];
        const values = { date: today };
        
        // إنشاء النموذج
        const form = UI.createForm({
            fields: fields,
            values: values,
            submitText: 'تسجيل المدخول',
            onSubmit: (formData) => {
                this.addIncome(formData);
                modal.hide();
            },
            onCancel: () => modal.hide()
        });
        
        // إنشاء المربع الحواري
        const modal = UI.createModal({
            id: 'add-income-modal',
            title: 'تسجيل مدخول جديد',
            content: form
        });
        
        // عرض المربع الحواري
        modal.show();
    },

    // إضافة مدخول
    addIncome: function(incomeData) {
        const newIncome = DataManager.addCafeteriaIncome(incomeData);
        
        if (newIncome) {
            // تحديث عرض المدخولات
            this.loadCafeteriaData();
            
            // عرض إشعار نجاح
            UI.showNotification(`تم تسجيل مدخول جديد بقيمة ${UI.formatCurrency(newIncome.amount)} بنجاح`, 'success');
        } else {
            UI.showNotification('حدث خطأ أثناء تسجيل المدخول', 'error');
        }
    },

    // حذف مدخول
    deleteIncome: function(incomeId) {
        try {
            if (!incomeId) {
                UI.showNotification('معرف المدخول غير صالح', 'error');
                return;
            }
            
            const income = DataManager.getAllCafeteriaIncome();
            const incomeItem = income.find(inc => inc.id === incomeId);
            
            if (!incomeItem) {
                UI.showNotification('لم يتم العثور على المدخول', 'error');
                return;
            }
            
            // طلب تأكيد الحذف
            if (confirm(`هل أنت متأكد من رغبتك في حذف المدخول بقيمة ${UI.formatCurrency(incomeItem.amount)}؟`)) {
                // حذف المدخول من المصفوفة
                const index = DataManager.data.cafeteriaIncome.findIndex(inc => inc.id === incomeId);
                if (index !== -1) {
                    DataManager.data.cafeteriaIncome.splice(index, 1);
                    
                    try {
                        localStorage.setItem('cafeteriaIncome', JSON.stringify(DataManager.data.cafeteriaIncome));
                    } catch (storageError) {
                        console.error('خطأ في حفظ البيانات:', storageError);
                        UI.showNotification('حدث خطأ أثناء حفظ البيانات', 'warning');
                    }
                    
                    // تحديث عرض المدخولات
                    this.loadCafeteriaData();
                    
                    // إضافة نشاط
                    App.addActivity('حذف مدخول', `تم حذف مدخول بقيمة ${UI.formatCurrency(incomeItem.amount)}`);
                    
                    // عرض إشعار نجاح
                    UI.showNotification(`تم حذف المدخول بنجاح`, 'success');
                } else {
                    UI.showNotification('حدث خطأ أثناء حذف المدخول', 'error');
                }
            }
        } catch (error) {
            console.error('خطأ في حذف المدخول:', error);
            UI.showNotification('حدث خطأ غير متوقع أثناء حذف المدخول', 'error');
        }
    },

    // طباعة التقرير المالي
    printFinancialReport: function() {
        const expenses = DataManager.getAllCafeteriaExpenses();
        const income = DataManager.getAllCafeteriaIncome();
        
        // تجميع المصاريف حسب الفئة
        const expensesByCategory = {};
        expenses.forEach(expense => {
            if (!expensesByCategory[expense.category]) {
                expensesByCategory[expense.category] = 0;
            }
            expensesByCategory[expense.category] += parseFloat(expense.amount);
        });
        
        // تجميع المدخولات حسب المصدر
        const incomeBySource = {};
        income.forEach(inc => {
            if (!incomeBySource[inc.source]) {
                incomeBySource[inc.source] = 0;
            }
            incomeBySource[inc.source] += parseFloat(inc.amount);
        });
        
        // إنشاء محتوى التقرير
        const reportContent = `
            <div class="financial-report">
                <h2 class="text-center mb-4">التقرير المالي للمطعم المدرسي</h2>
                <div class="row">
                    <div class="col-md-6">
                        <h4>ملخص المصاريف</h4>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>الفئة</th>
                                    <th>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(expensesByCategory).map(([category, amount]) => `
                                    <tr>
                                        <td>${category}</td>
                                        <td>${UI.formatCurrency(amount)}</td>
                                    </tr>
                                `).join('')}
                                <tr class="table-secondary">
                                    <td><strong>المجموع</strong></td>
                                    <td><strong>${UI.formatCurrency(DataManager.getTotalCafeteriaExpenses())}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h4>ملخص المدخولات</h4>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>المصدر</th>
                                    <th>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(incomeBySource).map(([source, amount]) => `
                                    <tr>
                                        <td>${source}</td>
                                        <td>${UI.formatCurrency(amount)}</td>
                                    </tr>
                                `).join('')}
                                <tr class="table-secondary">
                                    <td><strong>المجموع</strong></td>
                                    <td><strong>${UI.formatCurrency(DataManager.getTotalCafeteriaIncome())}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12">
                        <h4>الرصيد الحالي</h4>
                        <div class="alert ${DataManager.getCafeteriaBalance() >= 0 ? 'alert-success' : 'alert-danger'}">
                            <strong>الرصيد: ${UI.formatCurrency(DataManager.getCafeteriaBalance())}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // طباعة التقرير
        UI.printContent(reportContent, 'التقرير المالي للمطعم المدرسي');
    }
};