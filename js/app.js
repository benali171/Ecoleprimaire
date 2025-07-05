/**
 * منصة إدارة المدرسة الابتدائية
 * الملف الرئيسي للتطبيق - يحتوي على الوظائف الأساسية والتهيئة
 */

// كائن التطبيق الرئيسي
const App = {
    // حالة التطبيق
    state: {
        currentPage: 'dashboard',
        schoolInfo: null,
        lastActivities: []
    },

    // تهيئة التطبيق
    init: function() {
        console.log('تهيئة التطبيق...');
        
        // تحميل بيانات المدرسة من التخزين المحلي
        this.loadSchoolInfo();
        
        // تهيئة واجهة المستخدم
        UI.init();
        
        // تهيئة مديري البيانات
        DataManager.init();
        
        // تهيئة الصفحات
        StudentsManager.init();
        TeachersManager.init();
        CafeteriaManager.init();
        DocumentsManager.init();
        StatisticsManager.init();
        
        // تحديث لوحة التحكم
        this.updateDashboard();
        
        console.log('تم تهيئة التطبيق بنجاح');
    },

    // تحميل معلومات المدرسة
    loadSchoolInfo: function() {
        const savedInfo = localStorage.getItem('schoolInfo');
        if (savedInfo) {
            this.state.schoolInfo = JSON.parse(savedInfo);
        } else {
            // إعداد معلومات افتراضية للمدرسة
            this.state.schoolInfo = {
                name: 'مدرسة الجزائر الابتدائية',
                address: 'الجزائر العاصمة',
                phone: '0123456789',
                email: 'school@example.com',
                principal: 'مدير المدرسة',
                logo: null
            };
            // حفظ المعلومات في التخزين المحلي
            localStorage.setItem('schoolInfo', JSON.stringify(this.state.schoolInfo));
        }
    },

    // حفظ معلومات المدرسة
    saveSchoolInfo: function(info) {
        this.state.schoolInfo = info;
        localStorage.setItem('schoolInfo', JSON.stringify(info));
        this.addActivity('تحديث معلومات المدرسة', 'تم تحديث بيانات المدرسة');
    },

    // تغيير الصفحة الحالية
    changePage: function(pageName) {
        // إخفاء جميع الصفحات
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // إظهار الصفحة المطلوبة
        document.getElementById(`${pageName}-page`).classList.add('active');
        
        // تحديث العنوان
        document.getElementById('page-title').textContent = document.querySelector(`[data-page="${pageName}"]`).textContent.trim();
        
        // تحديث القائمة النشطة
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
        
        // تحديث حالة التطبيق
        this.state.currentPage = pageName;
        
        // تحديث الصفحة المحددة إذا كانت تحتاج إلى تحديث
        switch(pageName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'students':
                StudentsManager.loadStudentsPage();
                break;
            case 'teachers':
                TeachersManager.loadTeachersPage();
                break;
            case 'cafeteria':
                CafeteriaManager.loadCafeteriaPage();
                break;
            case 'cafeteria-workers':
                CafeteriaManager.loadWorkersPage();
                break;
            case 'documents':
                DocumentsManager.loadDocumentsPage();
                break;
            case 'statistics':
                StatisticsManager.loadStatisticsPage();
                break;
            case 'settings':
                this.loadSettingsPage();
                break;
        }
    },

    // تحديث لوحة التحكم
    updateDashboard: function() {
        // تحديث إحصائيات لوحة التحكم
        document.getElementById('total-students').textContent = DataManager.getStudentsCount();
        document.getElementById('total-teachers').textContent = DataManager.getTeachersCount();
        document.getElementById('total-cafeteria-users').textContent = DataManager.getCafeteriaUsersCount();
        document.getElementById('total-cafeteria-workers').textContent = DataManager.getCafeteriaWorkersCount();
        
        // تحديث الرسوم البيانية
        this.updateClassesChart();
        this.updateGenderChart();
        
        // تحديث آخر العمليات
        this.updateRecentActivities();
    },

    // تحديث رسم بياني للأقسام
    updateClassesChart: function() {
        const classesData = DataManager.getStudentsCountByClass();
        const ctx = document.getElementById('classes-chart').getContext('2d');
        
        // إذا كان الرسم البياني موجود مسبقًا، قم بتدميره
        if (window.classesChart) {
            window.classesChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        window.classesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(classesData),
                datasets: [{
                    label: 'عدد التلاميذ',
                    data: Object.values(classesData),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        precision: 0
                    }
                }
            }
        });
    },

    // تحديث رسم بياني للجنس
    updateGenderChart: function() {
        const genderData = DataManager.getStudentsCountByGender();
        const ctx = document.getElementById('gender-chart').getContext('2d');
        
        // إذا كان الرسم البياني موجود مسبقًا، قم بتدميره
        if (window.genderChart) {
            window.genderChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        window.genderChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['ذكور', 'إناث'],
                datasets: [{
                    data: [genderData.male, genderData.female],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(231, 76, 60, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(231, 76, 60, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    },

    // إضافة نشاط جديد
    addActivity: function(title, details) {
        const activity = {
            title: title,
            details: details,
            date: new Date().toLocaleString('ar-DZ')
        };
        
        // إضافة النشاط إلى بداية المصفوفة
        this.state.lastActivities.unshift(activity);
        
        // الاحتفاظ فقط بآخر 20 نشاط
        if (this.state.lastActivities.length > 20) {
            this.state.lastActivities.pop();
        }
        
        // حفظ الأنشطة في التخزين المحلي
        localStorage.setItem('lastActivities', JSON.stringify(this.state.lastActivities));
        
        // تحديث عرض الأنشطة إذا كنا في لوحة التحكم
        if (this.state.currentPage === 'dashboard') {
            this.updateRecentActivities();
        }
    },

    // تحديث عرض آخر الأنشطة
    updateRecentActivities: function() {
        const activitiesContainer = document.getElementById('recent-activities');
        
        // تحميل الأنشطة من التخزين المحلي إذا كانت موجودة
        if (localStorage.getItem('lastActivities')) {
            this.state.lastActivities = JSON.parse(localStorage.getItem('lastActivities'));
        }
        
        // إفراغ الحاوية
        activitiesContainer.innerHTML = '';
        
        // إذا لم تكن هناك أنشطة، عرض رسالة
        if (this.state.lastActivities.length === 0) {
            activitiesContainer.innerHTML = '<tr><td colspan="3" class="text-center">لا توجد عمليات حديثة</td></tr>';
            return;
        }
        
        // إضافة الأنشطة إلى الجدول
        this.state.lastActivities.forEach(activity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${activity.title}</td>
                <td>${activity.details}</td>
                <td>${activity.date}</td>
            `;
            activitiesContainer.appendChild(row);
        });
    },

    // تحميل صفحة الإعدادات
    loadSettingsPage: function() {
        const settingsPage = document.getElementById('settings-page');
        
        settingsPage.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title">إعدادات المدرسة</h5>
                </div>
                <div class="card-body">
                    <form id="school-settings-form">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="school-name" class="form-label">اسم المدرسة</label>
                                <input type="text" class="form-control" id="school-name" value="${this.state.schoolInfo.name}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="school-address" class="form-label">العنوان</label>
                                <input type="text" class="form-control" id="school-address" value="${this.state.schoolInfo.address}" required>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="school-phone" class="form-label">رقم الهاتف</label>
                                <input type="text" class="form-control" id="school-phone" value="${this.state.schoolInfo.phone}">
                            </div>
                            <div class="col-md-6">
                                <label for="school-email" class="form-label">البريد الإلكتروني</label>
                                <input type="email" class="form-control" id="school-email" value="${this.state.schoolInfo.email}">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="school-principal" class="form-label">اسم المدير</label>
                                <input type="text" class="form-control" id="school-principal" value="${this.state.schoolInfo.principal}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="school-logo" class="form-label">شعار المدرسة</label>
                                <input type="file" class="form-control" id="school-logo" accept="image/*">
                                <small class="form-text text-muted">اختياري: اختر صورة شعار المدرسة</small>
                            </div>
                        </div>
                        <div class="text-start">
                            <button type="submit" class="btn btn-primary">حفظ الإعدادات</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="card mt-4">
                <div class="card-header">
                    <h5 class="card-title">إدارة البيانات</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <h6>تصدير البيانات</h6>
                                <p class="text-muted">قم بتصدير جميع بيانات المنصة كملف JSON للنسخ الاحتياطي</p>
                                <button id="export-data" class="btn btn-info">تصدير البيانات</button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <h6>استيراد البيانات</h6>
                                <p class="text-muted">استيراد بيانات من ملف JSON تم تصديره مسبقًا</p>
                                <div class="input-group">
                                    <input type="file" class="form-control" id="import-file" accept=".json">
                                    <button id="import-data" class="btn btn-warning">استيراد</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-12">
                            <div class="alert alert-danger">
                                <h6>حذف جميع البيانات</h6>
                                <p>سيؤدي هذا الإجراء إلى حذف جميع البيانات المخزنة في المنصة. هذا الإجراء لا يمكن التراجع عنه.</p>
                                <button id="reset-data" class="btn btn-danger">حذف جميع البيانات</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        document.getElementById('school-settings-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // جمع البيانات من النموذج
            const schoolInfo = {
                name: document.getElementById('school-name').value,
                address: document.getElementById('school-address').value,
                phone: document.getElementById('school-phone').value,
                email: document.getElementById('school-email').value,
                principal: document.getElementById('school-principal').value,
                logo: App.state.schoolInfo.logo // الاحتفاظ بالشعار الحالي
            };
            
            // حفظ البيانات
            App.saveSchoolInfo(schoolInfo);
            
            // عرض إشعار نجاح
            UI.showNotification('تم حفظ الإعدادات بنجاح', 'success');
        });
        
        // معالجة تحميل الشعار
        document.getElementById('school-logo').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // تحديث الشعار في حالة التطبيق
                    App.state.schoolInfo.logo = event.target.result;
                    // حفظ في التخزين المحلي
                    localStorage.setItem('schoolInfo', JSON.stringify(App.state.schoolInfo));
                    // تحديث الشعار في الواجهة
                    document.querySelector('.school-logo img').src = event.target.result;
                    // عرض إشعار
                    UI.showNotification('تم تحديث شعار المدرسة', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
        
        // تصدير البيانات
        document.getElementById('export-data').addEventListener('click', function() {
            DataManager.exportData();
        });
        
        // استيراد البيانات
        document.getElementById('import-data').addEventListener('click', function() {
            const fileInput = document.getElementById('import-file');
            if (fileInput.files.length > 0) {
                DataManager.importData(fileInput.files[0]);
            } else {
                UI.showNotification('الرجاء اختيار ملف للاستيراد', 'error');
            }
        });
        
        // إعادة تعيين البيانات
        document.getElementById('reset-data').addEventListener('click', function() {
            if (confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                DataManager.resetData();
                UI.showNotification('تم حذف جميع البيانات بنجاح', 'success');
                // إعادة تحميل الصفحة
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        });
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
