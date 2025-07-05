/**
 * نظام إدارة عمال المطعم المدرسي
 * يتضمن إدارة العمال، الحضور، المهام، والتقارير
 */

// المتغيرات العامة
let cafeteriaWorkers = [];
let workerAttendance = [];
let workerTasks = [];
let workerPerformance = [];

// تهيئة صفحة عمال المطعم
function initCafeteriaWorkersPage() {
    console.log("تهيئة صفحة عمال المطعم");
    
    // تحميل البيانات من التخزين المحلي
    loadCafeteriaWorkersData();
    
    // عرض البيانات في الجداول
    renderCafeteriaWorkers();
    renderWorkerAttendance();
    renderWorkerTasks();
    
    // تحديث الإحصائيات
    updateCafeteriaWorkersStats();
    
    // إنشاء الرسوم البيانية
    createWorkerAttendanceChart();
    createWorkerPerformanceChart();
    
    // إضافة مستمعي الأحداث للأزرار
    setupCafeteriaWorkersEventListeners();
}

// تحميل بيانات عمال المطعم من التخزين المحلي
function loadCafeteriaWorkersData() {
    cafeteriaWorkers = JSON.parse(localStorage.getItem('cafeteriaWorkers')) || [];
    workerAttendance = JSON.parse(localStorage.getItem('workerAttendance')) || [];
    workerTasks = JSON.parse(localStorage.getItem('workerTasks')) || [];
    workerPerformance = JSON.parse(localStorage.getItem('workerPerformance')) || [];
}

// حفظ بيانات عمال المطعم في التخزين المحلي
function saveCafeteriaWorkersData() {
    localStorage.setItem('cafeteriaWorkers', JSON.stringify(cafeteriaWorkers));
    localStorage.setItem('workerAttendance', JSON.stringify(workerAttendance));
    localStorage.setItem('workerTasks', JSON.stringify(workerTasks));
    localStorage.setItem('workerPerformance', JSON.stringify(workerPerformance));
    
    // تحديث الإحصائيات
    updateCafeteriaWorkersStats();
}

// إعداد مستمعي الأحداث
function setupCafeteriaWorkersEventListeners() {
    // أزرار الإضافة
    document.getElementById('add-worker-btn').addEventListener('click', showAddWorkerModal);
    document.getElementById('add-worker-attendance-btn').addEventListener('click', showAddWorkerAttendanceModal);
    document.getElementById('add-worker-task-btn').addEventListener('click', showAddWorkerTaskModal);
    document.getElementById('add-worker-performance-btn').addEventListener('click', showAddWorkerPerformanceModal);
    document.getElementById('print-workers-report-btn').addEventListener('click', printWorkersReport);
    
    // أزرار تصدير واستيراد البيانات
    document.getElementById('export-workers-excel-btn').addEventListener('click', exportWorkersToExcel);
    document.getElementById('import-workers-excel-btn').addEventListener('click', importWorkersFromExcel);
    document.getElementById('backup-workers-data-btn').addEventListener('click', backupWorkersData);
    document.getElementById('restore-workers-data-btn').addEventListener('click', restoreWorkersData);
    
    // تعيين التاريخ الحالي لحقول التاريخ
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('worker-attendance-date').value = today;
}

// ... existing code ...

// تصدير بيانات العمال إلى ملف إكسل
function exportWorkersToExcel() {
    // إنشاء مصفوفة لبيانات العمال
    const workersData = [
        ['الرقم', 'الاسم', 'المنصب', 'رقم الهاتف', 'تاريخ البداية', 'الحالة']
    ];
    
    cafeteriaWorkers.forEach((worker, index) => {
        workersData.push([
            index + 1,
            worker.name,
            worker.position,
            worker.phone,
            worker.startDate,
            worker.active ? 'نشط' : 'غير نشط'
        ]);
    });
    
    // إنشاء مصفوفة لبيانات الحضور
    const attendanceData = [
        ['التاريخ', 'العامل', 'الحالة', 'وقت الحضور', 'وقت الانصراف', 'ملاحظات']
    ];
    
    workerAttendance.forEach(record => {
        attendanceData.push([
            record.date,
            record.workerName,
            record.status,
            record.timeIn || '-',
            record.timeOut || '-',
            record.notes || '-'
        ]);
    });
    
    // إنشاء مصفوفة لبيانات المهام
    const tasksData = [
        ['العامل', 'المهمة', 'تاريخ التكليف', 'تاريخ الاستحقاق', 'الأولوية', 'الحالة']
    ];
    
    workerTasks.forEach(task => {
        tasksData.push([
            task.workerName,
            task.description,
            task.assignDate,
            task.dueDate || '-',
            task.priority || 'عادية',
            task.status
        ]);
    });
    
    // إنشاء كائن Workbook جديد
    const wb = XLSX.utils.book_new();
    
    // إضافة ورقة العمال
    const wsWorkers = XLSX.utils.aoa_to_sheet(workersData);
    XLSX.utils.book_append_sheet(wb, wsWorkers, "العمال");
    
    // إضافة ورقة الحضور
    const wsAttendance = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, wsAttendance, "الحضور");
    
    // إضافة ورقة المهام
    const wsTasks = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, wsTasks, "المهام");
    
    // تحديد اسم الملف
    const fileName = `بيانات_عمال_المطعم_${formatDateForFileName(new Date())}.xlsx`;
    
    // تصدير الملف
    XLSX.writeFile(wb, fileName);
    
    // عرض رسالة نجاح
    showAlert('تم تصدير البيانات بنجاح إلى ملف إكسل', 'success');
}

// استيراد بيانات العمال من ملف إكسل
function importWorkersFromExcel() {
    // إنشاء عنصر input لاختيار الملف
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // استيراد بيانات العمال
                if (workbook.SheetNames.includes('العمال')) {
                    const worksheet = workbook.Sheets['العمال'];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // تجاهل الصف الأول (العناوين)
                    const newWorkers = [];
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row.length >= 5) {
                            newWorkers.push({
                                id: generateId(),
                                name: row[1],
                                position: row[2],
                                phone: row[3],
                                startDate: row[4],
                                active: row[5] === 'نشط'
                            });
                        }
                    }
                    
                    // عرض نافذة تأكيد
                    if (confirm(`سيتم استيراد ${newWorkers.length} عامل. هل تريد المتابعة؟`)) {
                        cafeteriaWorkers = newWorkers;
                        saveCafeteriaWorkersData();
                        renderCafeteriaWorkers();
                        showAlert(`تم استيراد ${newWorkers.length} عامل بنجاح`, 'success');
                    }
                } else {
                    showAlert('لم يتم العثور على ورقة "العمال" في الملف المحدد', 'danger');
                }
                
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                showAlert('حدث خطأ أثناء استيراد البيانات', 'danger');
            }
        };
        reader.readAsArrayBuffer(file);
    });
    
    // تشغيل نافذة اختيار الملف
    fileInput.click();
}

// حفظ نسخة احتياطية من البيانات
function backupWorkersData() {
    // جمع جميع البيانات في كائن واحد
    const backupData = {
        cafeteriaWorkers: cafeteriaWorkers,
        workerAttendance: workerAttendance,
        workerTasks: workerTasks,
        workerPerformance: workerPerformance,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    // تحويل البيانات إلى سلسلة JSON
    const jsonData = JSON.stringify(backupData);
    
    // إنشاء Blob
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // إنشاء رابط تنزيل
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `نسخة_احتياطية_عمال_المطعم_${formatDateForFileName(new Date())}.json`;
    
    // إضافة الرابط إلى المستند وتشغيله
    document.body.appendChild(a);
    a.click();
    
    // إزالة الرابط
    document.body.removeChild(a);
    
    // عرض رسالة نجاح
    showAlert('تم حفظ نسخة احتياطية من البيانات بنجاح', 'success');
}

// استعادة نسخة احتياطية من البيانات
function restoreWorkersData() {
    // إنشاء عنصر input لاختيار الملف
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // التحقق من صحة البيانات
                if (!backupData.cafeteriaWorkers || !backupData.workerAttendance || 
                    !backupData.workerTasks || !backupData.workerPerformance) {
                    throw new Error('تنسيق النسخة الاحتياطية غير صالح');
                }
                
                // عرض نافذة تأكيد
                if (confirm(`سيتم استعادة النسخة الاحتياطية المؤرخة بتاريخ ${formatDate(backupData.timestamp)}. هل تريد المتابعة؟`)) {
                    // استعادة البيانات
                    cafeteriaWorkers = backupData.cafeteriaWorkers;
                    workerAttendance = backupData.workerAttendance;
                    workerTasks = backupData.workerTasks;
                    workerPerformance = backupData.workerPerformance;
                    
                    // حفظ البيانات وتحديث العرض
                    saveCafeteriaWorkersData();
                    renderCafeteriaWorkers();
                    renderWorkerAttendance();
                    renderWorkerTasks();
                    
                    // تحديث الإحصائيات والرسوم البيانية
                    updateCafeteriaWorkersStats();
                    createWorkerAttendanceChart();
                    createWorkerPerformanceChart();
                    
                    // عرض رسالة نجاح
                    showAlert('تم استعادة النسخة الاحتياطية بنجاح', 'success');
                }
                
            } catch (error) {
                console.error('خطأ في استعادة النسخة الاحتياطية:', error);
                showAlert('حدث خطأ أثناء استعادة النسخة الاحتياطية', 'danger');
            }
        };
        reader.readAsText(file);
    });
    
    // تشغيل نافذة اختيار الملف
    fileInput.click();
}

// تنسيق التاريخ لاستخدامه في اسم الملف
function formatDateForFileName(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}`;
}

// تسجيل الخروج
function logout() {
    // تسجيل نشاط تسجيل الخروج
    if (currentUser) {
        addActivity('تسجيل الخروج', `تم تسجيل الخروج بواسطة ${currentUser.name}`);
    }
    
    // إزالة المستخدم الحالي من التخزين المحلي
    localStorage.removeItem('currentUser');
    currentUser = null;
    
    // إعادة تحميل الصفحة
    location.reload();
}

// تحديث واجهة المستخدم بناءً على المستخدم الحالي
function updateUserInterface() {
    // إضافة معلومات المستخدم إلى الشريط العلوي
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement && currentUser) {
        userInfoElement.innerHTML = `
            <span class="me-2">مرحباً، ${currentUser.name}</span>
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="#" id="profile-link"><i class="fas fa-id-card"></i> الملف الشخصي</a></li>
                    ${currentUser.role === 'admin' ? '<li><a class="dropdown-item" href="#" id="manage-users-link"><i class="fas fa-users-cog"></i> إدارة المستخدمين</a></li>' : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</a></li>
                </ul>
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        document.getElementById('profile-link').addEventListener('click', showUserProfile);
        document.getElementById('logout-link').addEventListener('click', logout);
        
        // إضافة رابط إدارة المستخدمين للمسؤولين فقط
        if (currentUser.role === 'admin') {
            document.getElementById('manage-users-link').addEventListener('click', showManageUsersModal);
        }
    }
    
    // إخفاء/إظهار العناصر بناءً على دور المستخدم
    updateUIBasedOnRole();
}

// تحديث واجهة المستخدم بناءً على دور المستخدم
function updateUIBasedOnRole() {
    if (!currentUser) return;
    
    // عناصر خاصة بالمسؤول فقط
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    
    adminOnlyElements.forEach(element => {
        if (currentUser.role === 'admin') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    
    // عناصر خاصة بالمشرفين والمسؤولين
    const supervisorElements = document.querySelectorAll('.supervisor-up');
    
    supervisorElements.forEach(element => {
        if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// عرض الملف الشخصي للمستخدم
function showUserProfile() {
    if (!currentUser) return;
    
    // البحث عن معلومات المستخدم الكاملة
    const user = users.find(u => u.id === currentUser.id);
    
    if (!user) {
        showAlert('لم يتم العثور على معلومات المستخدم', 'danger');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = createModal('الملف الشخصي', `
        <div class="row">
            <div class="col-md-4 text-center mb-3">
                <div class="avatar-container">
                    <i class="fas fa-user-circle fa-6x"></i>
                </div>
                <h5 class="mt-2">${user.name}</h5>
                <span class="badge bg-primary">${getRoleName(user.role)}</span>
            </div>
            <div class="col-md-8">
                <form id="profile-form">
                    <div class="mb-3">
                        <label for="profile-username" class="form-label">اسم المستخدم</label>
                        <input type="text" class="form-control" id="profile-username" value="${user.username}" readonly>
                    </div>
                    <div class="mb-3">
                        <label for="profile-name" class="form-label">الاسم الكامل</label>
                        <input type="text" class="form-control" id="profile-name" value="${user.name}" required>
                    </div>
                    <div class="mb-3">
                        <label for="profile-current-password" class="form-label">كلمة المرور الحالية</label>
                        <input type="password" class="form-control" id="profile-current-password">
                        <div class="form-text">أدخل كلمة المرور الحالية فقط إذا كنت ترغب في تغييرها</div>
                    </div>
                    <div class="mb-3">
                        <label for="profile-new-password" class="form-label">كلمة المرور الجديدة</label>
                        <input type="password" class="form-control" id="profile-new-password">
                    </div>
                    <div class="mb-3">
                        <label for="profile-confirm-password" class="form-label">تأكيد كلمة المرور الجديدة</label>
                        <input type="password" class="form-control" id="profile-confirm-password">
                    </div>
                    <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                </form>
            </div>
        </div>
    `);
    
    // معالجة إرسال النموذج
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('profile-name').value;
        const currentPassword = document.getElementById('profile-current-password').value;
        const newPassword = document.getElementById('profile-new-password').value;
        const confirmPassword = document.getElementById('profile-confirm-password').value;
        
        // التحقق من كلمة المرور الحالية إذا تم إدخالها
        if (currentPassword) {
            if (!verifyPassword(currentPassword, user.password)) {
                showAlert('كلمة المرور الحالية غير صحيحة', 'danger');
                return;
            }
            
            // التحقق من تطابق كلمة المرور الجديدة
            if (newPassword !== confirmPassword) {
                showAlert('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'danger');
                return;
            }
            
            // التحقق من طول كلمة المرور
            if (newPassword.length < 6) {
                showAlert('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل', 'danger');
                return;
            }
            
            // تحديث كلمة المرور
            user.password = hashPassword(newPassword);
        }
        
        // تحديث الاسم
        user.name = name;
        user.updatedAt = new Date().toISOString();
        
        // تحديث المستخدم في المصفوفة
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
        }
        
        // تحديث التخزين المحلي
        localStorage.setItem('users', JSON.stringify(users));
        
        // تحديث المستخدم الحالي
        currentUser.name = name;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // تحديث واجهة المستخدم
        updateUserInterface();
        
        // إضافة نشاط
        addActivity('تحديث الملف الشخصي', 'تم تحديث الملف الشخصي');
        
        // إغلاق النافذة المنبثقة
        closeModal();
        
        // عرض رسالة نجاح
        showAlert('تم تحديث الملف الشخصي بنجاح', 'success');
    });
}

// عرض نافذة إدارة المستخدمين
function showManageUsersModal() {
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('ليس لديك صلاحية للوصول إلى هذه الصفحة', 'danger');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = createModal('إدارة المستخدمين', `
        <div class="mb-3">
            <button id="add-user-btn" class="btn btn-primary">
                <i class="fas fa-plus"></i> إضافة مستخدم جديد
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>اسم المستخدم</th>
                        <th>الاسم الكامل</th>
                        <th>الدور</th>
                        <th>الحالة</th>
                        <th>تاريخ الإنشاء</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="users-list">
                    <!-- سيتم ملء هذا الجدول بالبيانات -->
                </tbody>
            </table>
        </div>
    `, 'xl');
    
    // عرض المستخدمين
    renderUsers();
    
    // إضافة مستمع الحدث لزر إضافة مستخدم جديد
    document.getElementById('add-user-btn').addEventListener('click', showAddUserModal);
}

// عرض المستخدمين
function renderUsers() {
    const tableBody = document.getElementById('users-list');
    tableBody.innerHTML = '';
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>${getRoleName(user.role)}</td>
            <td><span class="badge ${user.active ? 'bg-success' : 'bg-danger'}">${user.active ? 'نشط' : 'غير نشط'}</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button class="btn btn-sm btn-info edit-user" data-id="${user.id}" ${user.username === 'admin' && currentUser.username !== 'admin' ? 'disabled' : ''}>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${user.active ? 'btn-warning' : 'btn-success'} toggle-user-status" data-id="${user.id}" ${user.username === 'admin' ? 'disabled' : ''}>
                    <i class="fas ${user.active ? 'fa-ban' : 'fa-check'}"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}" ${user.username === 'admin' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.dataset.id));
    });
    
    document.querySelectorAll('.toggle-user-status').forEach(btn => {
        btn.addEventListener('click', () => toggleUserStatus(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

// عرض نافذة إضافة مستخدم جديد
function showAddUserModal() {
    // إنشاء النافذة المنبثقة
    const modal = createModal('إضافة مستخدم جديد', `
        <form id="add-user-form">
            <div class="mb-3">
                <label for="user-username" class="form-label">اسم المستخدم</label>
                <input type="text" class="form-control" id="user-username" required>
            </div>
            <div class="mb-3">
                <label for="user-name" class="form-label">الاسم الكامل</label>
                <input type="text" class="form-control" id="user-name" required>
            </div>
            <div class="mb-3">
                <label for="user-password" class="form-label">كلمة المرور</label>
                <input type="password" class="form-control" id="user-password" required>
                <div class="form-text">يجب أن تكون كلمة المرور 6 أحرف على الأقل</div>
            </div>
            <div class="mb-3">
                <label for="user-role" class="form-label">الدور</label>
                <select class="form-select" id="user-role" required>
                    <option value="user">مستخدم عادي</option>
                    <option value="supervisor">مشرف</option>
                    <option value="admin">مدير</option>
                </select>
            </div>
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="user-active" checked>
                <label class="form-check-label" for="user-active">نشط</label>
            </div>
            <button type="submit" class="btn btn-primary">حفظ</button>
        </form>
    `);
    
    // معالجة إرسال النموذج
    document.getElementById('add-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('user-username').value;
        const name = document.getElementById('user-name').value;
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;
        const active = document.getElementById('user-active').checked;
        
        // التحقق من طول كلمة المرور
        if (password.length < 6) {
            showAlert('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'danger');
            return;
        }
        
        // التحقق من عدم تكرار اسم المستخدم
        if (users.some(u => u.username === username)) {
            showAlert('اسم المستخدم موجود بالفعل', 'danger');
            return;
        }
        
        // إنشاء مستخدم جديد
        const newUser = {
            id: generateId(),
            username: username,
            name: name,
            password: hashPassword(password),
            role: role,
            active: active,
            createdAt: new Date().toISOString()
        };
        
        // إضافة المستخدم إلى المصفوفة
        users.push(newUser);
        
        // تحديث التخزين المحلي
        localStorage.setItem('users', JSON.stringify(users));
        
        // تحديث عرض المستخدمين
        renderUsers();
        
        // إضافة نشاط
        addActivity('إضافة مستخدم', `تم إضافة مستخدم جديد: ${username}`);
        
        // إغلاق النافذة المنبثقة
        closeModal();
        
        // عرض رسالة نجاح
        showAlert('تم إضافة المستخدم بنجاح', 'success');
    });
}

// تعديل مستخدم
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showAlert('لم يتم العثور على المستخدم', 'danger');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = createModal('تعديل المستخدم', `
        <form id="edit-user-form">
            <div class="mb-3">
                <label for="edit-user-username" class="form-label">اسم المستخدم</label>
                <input type="text" class="form-control" id="edit-user-username" value="${user.username}" ${user.username === 'admin' ? 'readonly' : 'required'}>
            </div>
            <div class="mb-3">
                <label for="edit-user-name" class="form-label">الاسم الكامل</label>
                <input type="text" class="form-control" id="edit-user-name" value="${user.name}" required>
            </div>
            <div class="mb-3">
                <label for="edit-user-password" class="form-label">كلمة المرور الجديدة</label>
                <input type="password" class="form-control" id="edit-user-password">
                <div class="form-text">اتركها فارغة إذا لم ترغب في تغيير كلمة المرور</div>
            </div>
            <div class="mb-3">
                <label for="edit-user-role" class="form-label">الدور</label>
                <select class="form-select" id="edit-user-role" ${user.username === 'admin' ? 'disabled' : 'required'}>
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>مستخدم عادي</option>
                    <option value="supervisor" ${user.role === 'supervisor' ? 'selected' : ''}>مشرف</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مدير</option>
                </select>
            </div>
            <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="edit-user-active" ${user.active ? 'checked' : ''} ${user.username === 'admin' ? 'disabled' : ''}>
                <label class="form-check-label" for="edit-user-active">نشط</label>
            </div>
            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
        </form>
    `);
    
    // معالجة إرسال النموذج
    document.getElementById('edit-user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('edit-user-username').value;
        const name = document.getElementById('edit-user-name').value;
        const password = document.getElementById('edit-user-password').value;
        const role = document.getElementById('edit-user-role').value;
        const active = document.getElementById('edit-user-active').checked;
        
        // التحقق من عدم تكرار اسم المستخدم
        if (username !== user.username && users.some(u => u.username === username)) {
            showAlert('اسم المستخدم موجود بالفعل', 'danger');
            return;
        }
        
        // تحديث بيانات المستخدم
        user.username = username;
        user.name = name;
        if (password) {
            // التحقق من طول كلمة المرور
            if (password.length < 6) {
                showAlert('يجب أن تكون كلمة المرور 6 أحرف على الأقل', 'danger');
                return;
            }
            user.password = hashPassword(password);
        }
        if (user.username !== 'admin') {
            user.role = role;
            user.active = active;
        }
        user.updatedAt = new Date().toISOString();
        
        // تحديث التخزين المحلي
        localStorage.setItem('users', JSON.stringify(users));
        
        // تحديث عرض المستخدمين
        renderUsers();
        
        // ذا كان المستخدم المعدل هو المستخدم الحالي، تحديث معلوماته
        if (currentUser.id === user.id) {
            currentUser.username = username;
            currentUser.name = name;
            currentUser.role = user.role;
            localStorage.setItem('currentUser', JSON.stringify(