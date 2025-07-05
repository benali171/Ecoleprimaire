/**
 * منصة إدارة المدرسة الابتدائية
 * مدير البيانات - مسؤول عن تخزين واسترجاع البيانات باستخدام LocalStorage
 */

const DataManager = {
    // بيانات التطبيق
    data: {
        students: [],
        teachers: [],
        cafeteriaWorkers: [],
        cafeteriaUsers: [],
        cafeteriaExpenses: [],
        cafeteriaIncome: []
    },

    // تهيئة مدير البيانات
    init: function() {
        console.log('تهيئة مدير البيانات...');
        this.loadAllData();
    },

    // تحميل جميع البيانات من التخزين المحلي
    loadAllData: function() {
        // تحميل بيانات التلاميذ
        const studentsData = localStorage.getItem('students');
        if (studentsData) {
            this.data.students = JSON.parse(studentsData);
        }

        // تحميل بيانات الأساتذة
        const teachersData = localStorage.getItem('teachers');
        if (teachersData) {
            this.data.teachers = JSON.parse(teachersData);
        }

        // تحميل بيانات عمال المطعم
        const cafeteriaWorkersData = localStorage.getItem('cafeteriaWorkers');
        if (cafeteriaWorkersData) {
            this.data.cafeteriaWorkers = JSON.parse(cafeteriaWorkersData);
        }

        // تحميل بيانات المستفيدين من المطعم
        const cafeteriaUsersData = localStorage.getItem('cafeteriaUsers');
        if (cafeteriaUsersData) {
            this.data.cafeteriaUsers = JSON.parse(cafeteriaUsersData);
        }

        // تحميل بيانات مصاريف المطعم
        const cafeteriaExpensesData = localStorage.getItem('cafeteriaExpenses');
        if (cafeteriaExpensesData) {
            this.data.cafeteriaExpenses = JSON.parse(cafeteriaExpensesData);
        }

        // تحميل بيانات مدخولات المطعم
        const cafeteriaIncomeData = localStorage.getItem('cafeteriaIncome');
        if (cafeteriaIncomeData) {
            this.data.cafeteriaIncome = JSON.parse(cafeteriaIncomeData);
        }

        console.log('تم تحميل البيانات بنجاح');
    },

    // حفظ جميع البيانات في التخزين المحلي
    saveAllData: function() {
        localStorage.setItem('students', JSON.stringify(this.data.students));
        localStorage.setItem('teachers', JSON.stringify(this.data.teachers));
        localStorage.setItem('cafeteriaWorkers', JSON.stringify(this.data.cafeteriaWorkers));
        localStorage.setItem('cafeteriaUsers', JSON.stringify(this.data.cafeteriaUsers));
        localStorage.setItem('cafeteriaExpenses', JSON.stringify(this.data.cafeteriaExpenses));
        localStorage.setItem('cafeteriaIncome', JSON.stringify(this.data.cafeteriaIncome));
    },

    // ===== وظائف إدارة التلاميذ =====
    
    // إضافة تلميذ جديد
    addStudent: function(student) {
        // إضافة معرف فريد للتلميذ
        student.id = this.generateId();
        student.createdAt = new Date().toISOString();
        
        this.data.students.push(student);
        localStorage.setItem('students', JSON.stringify(this.data.students));
        
        // إضافة نشاط
        App.addActivity('إضافة تلميذ', `تم إضافة التلميذ ${student.firstName} ${student.lastName}`);
        
        return student;
    },

    // تحديث بيانات تلميذ
    updateStudent: function(studentId, updatedData) {
        const index = this.data.students.findIndex(student => student.id === studentId);
        
        if (index !== -1) {
            // الاحتفاظ بالمعرف وتاريخ الإنشاء
            updatedData.id = this.data.students[index].id;
            updatedData.createdAt = this.data.students[index].createdAt;
            updatedData.updatedAt = new Date().toISOString();
            
            this.data.students[index] = updatedData;
            localStorage.setItem('students', JSON.stringify(this.data.students));
            
            // إضافة نشاط
            App.addActivity('تحديث بيانات تلميذ', `تم تحديث بيانات التلميذ ${updatedData.firstName} ${updatedData.lastName}`);
            
            return updatedData;
        }
        
        return null;
    },

    // حذف تلميذ
    deleteStudent: function(studentId) {
        const index = this.data.students.findIndex(student => student.id === studentId);
        
        if (index !== -1) {
            const deletedStudent = this.data.students[index];
            this.data.students.splice(index, 1);
            localStorage.setItem('students', JSON.stringify(this.data.students));
            
            // حذف التلميذ من المستفيدين من المطعم إذا كان مسجلاً
            this.removeCafeteriaUser(studentId);
            
            // إضافة نشاط
            App.addActivity('حذف تلميذ', `تم حذف التلميذ ${deletedStudent.firstName} ${deletedStudent.lastName}`);
            
            return true;
        }
        
        return false;
    },

    // الحصول على تلميذ بواسطة المعرف
    getStudentById: function(studentId) {
        return this.data.students.find(student => student.id === studentId) || null;
    },

    // الحصول على جميع التلاميذ
    getAllStudents: function() {
        return [...this.data.students];
    },

    // البحث عن التلاميذ
    searchStudents: function(query, filters = {}) {
        query = query.toLowerCase();
        
        return this.data.students.filter(student => {
            // البحث في الاسم
            const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(query);
            
            // تطبيق الفلاتر
            let classMatch = true;
            let genderMatch = true;
            
            if (filters.class && filters.class !== 'all') {
                classMatch = student.class === filters.class;
            }
            
            if (filters.gender && filters.gender !== 'all') {
                genderMatch = student.gender === filters.gender;
            }
            
            return nameMatch && classMatch && genderMatch;
        });
    },

    // الحصول على عدد التلاميذ
    getStudentsCount: function() {
        return this.data.students.length;
    },

    // الحصول على عدد التلاميذ حسب الصف
    getStudentsCountByClass: function() {
        const classCounts = {};
        
        // تهيئة العدادات لجميع الصفوف
        const classes = ['السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة', 'السنة الخامسة'];
        classes.forEach(cls => {
            classCounts[cls] = 0;
        });
        
        // حساب عدد التلاميذ في كل صف
        this.data.students.forEach(student => {
            if (classCounts.hasOwnProperty(student.class)) {
                classCounts[student.class]++;
            }
        });
        
        return classCounts;
    },

    // الحصول على عدد التلاميذ حسب الجنس
    getStudentsCountByGender: function() {
        let male = 0;
        let female = 0;
        
        this.data.students.forEach(student => {
            if (student.gender === 'ذكر') {
                male++;
            } else if (student.gender === 'أنثى') {
                female++;
            }
        });
        
        return { male, female };
    },

    // ===== وظائف إدارة الأساتذة =====
    
    // إضافة أستاذ جديد
    addTeacher: function(teacher) {
        // إضافة معرف فريد للأستاذ
        teacher.id = this.generateId();
        teacher.createdAt = new Date().toISOString();
        
        this.data.teachers.push(teacher);
        localStorage.setItem('teachers', JSON.stringify(this.data.teachers));
        
        // إضافة نشاط
        App.addActivity('إضافة أستاذ', `تم إضافة الأستاذ ${teacher.firstName} ${teacher.lastName}`);
        
        return teacher;
    },

    // تحديث بيانات أستاذ
    updateTeacher: function(teacherId, updatedData) {
        const index = this.data.teachers.findIndex(teacher => teacher.id === teacherId);
        
        if (index !== -1) {
            // الاحتفاظ بالمعرف وتاريخ الإنشاء
            updatedData.id = this.data.teachers[index].id;
            updatedData.createdAt = this.data.teachers[index].createdAt;
            updatedData.updatedAt = new Date().toISOString();
            
            this.data.teachers[index] = updatedData;
            localStorage.setItem('teachers', JSON.stringify(this.data.teachers));
            
            // إضافة نشاط
            App.addActivity('تحديث بيانات أستاذ', `تم تحديث بيانات الأستاذ ${updatedData.firstName} ${updatedData.lastName}`);
            
            return updatedData;
        }
        
        return null;
    },

    // حذف أستاذ
    deleteTeacher: function(teacherId) {
        const index = this.data.teachers.findIndex(teacher => teacher.id === teacherId);
        
        if (index !== -1) {
            const deletedTeacher = this.data.teachers[index];
            this.data.teachers.splice(index, 1);
            localStorage.setItem('teachers', JSON.stringify(this.data.teachers));
            
            // إضافة نشاط
            App.addActivity('حذف أستاذ', `تم حذف الأستاذ ${deletedTeacher.firstName} ${deletedTeacher.lastName}`);
            
            return true;
        }
        
        return false;
    },

    // الحصول على أستاذ بواسطة المعرف
    getTeacherById: function(teacherId) {
        return this.data.teachers.find(teacher => teacher.id === teacherId) || null;
    },

    // الحصول على جميع الأساتذة
    getAllTeachers: function() {
        return [...this.data.teachers];
    },

    // البحث عن الأساتذة
    searchTeachers: function(query, filters = {}) {
        query = query.toLowerCase();
        
        return this.data.teachers.filter(teacher => {
            // البحث في الاسم
            const nameMatch = `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(query);
            
            // تطبيق الفلاتر
            let specialtyMatch = true;
            
            if (filters.specialty && filters.specialty !== 'all') {
                specialtyMatch = teacher.specialty === filters.specialty;
            }
            
            return nameMatch && specialtyMatch;
        });
    },

    // الحصول على عدد الأساتذة
    getTeachersCount: function() {
        return this.data.teachers.length;
    },

    // ===== وظائف إدارة عمال المطعم =====
    
    // إضافة عامل مطعم جديد
    addCafeteriaWorker: function(worker) {
        // إضافة معرف فريد للعامل
        worker.id = this.generateId();
        worker.createdAt = new Date().toISOString();
        
        this.data.cafeteriaWorkers.push(worker);
        localStorage.setItem('cafeteriaWorkers', JSON.stringify(this.data.cafeteriaWorkers));
        
        // إضافة نشاط
        App.addActivity('إضافة عامل مطعم', `تم إضافة العامل ${worker.firstName} ${worker.lastName}`);
        
        return worker;
    },

    // تحديث بيانات عامل مطعم
    updateCafeteriaWorker: function(workerId, updatedData) {
        const index = this.data.cafeteriaWorkers.findIndex(worker => worker.id === workerId);
        
        if (index !== -1) {
            // الاحتفاظ بالمعرف وتاريخ الإنشاء
            updatedData.id = this.data.cafeteriaWorkers[index].id;
            updatedData.createdAt = this.data.cafeteriaWorkers[index].createdAt;
            updatedData.updatedAt = new Date().toISOString();
            
            this.data.cafeteriaWorkers[index] = updatedData;
            localStorage.setItem('cafeteriaWorkers', JSON.stringify(this.data.cafeteriaWorkers));
            
            // إضافة نشاط
            App.addActivity('تحديث بيانات عامل مطعم', `تم تحديث بيانات العامل ${updatedData.firstName} ${updatedData.lastName}`);
            
            return updatedData;
        }
        
        return null;
    },

    // حذف عامل مطعم
    deleteCafeteriaWorker: function(workerId) {
        const index = this.data.cafeteriaWorkers.findIndex(worker => worker.id === workerId);
        
        if (index !== -1) {
            const deletedWorker = this.data.cafeteriaWorkers[index];
            this.data.cafeteriaWorkers.splice(index, 1);
            localStorage.setItem('cafeteriaWorkers', JSON.stringify(this.data.cafeteriaWorkers));
            
            // إضافة نشاط
            App.addActivity('حذف عامل مطعم', `تم حذف العامل ${deletedWorker.firstName} ${deletedWorker.lastName}`);
            
            return true;
        }
        
        return false;
    },

    // الحصول على عامل مطعم بواسطة المعرف
    getCafeteriaWorkerById: function(workerId) {
        return this.data.cafeteriaWorkers.find(worker => worker.id === workerId) || null;
    },

    // الحصول على جميع عمال المطعم
    getAllCafeteriaWorkers: function() {
        return [...this.data.cafeteriaWorkers];
    },

    // الحصول على عدد عمال المطعم
    getCafeteriaWorkersCount: function() {
        return this.data.cafeteriaWorkers.length;
    },

    // ===== وظائف إدارة المطعم المدرسي =====
    
    // إضافة مستفيد من المطعم
    addCafeteriaUser: function(studentId) {
        // التحقق من وجود التلميذ
        const student = this.getStudentById(studentId);
        if (!student) return null;
        
        // التحقق من أن التلميذ ليس مسجلاً بالفعل
        const existingUser = this.data.cafeteriaUsers.find(user => user.studentId === studentId);
        if (existingUser) return existingUser;
        
        // إنشاء سجل المستفيد
        const cafeteriaUser = {
            id: this.generateId(),
            studentId: studentId,
            startDate: new Date().toISOString(),
            active: true
        };
        
        this.data.cafeteriaUsers.push(cafeteriaUser);
        localStorage.setItem('cafeteriaUsers', JSON.stringify(this.data.cafeteriaUsers));
        
        // إضافة نشاط
        App.addActivity('إضافة مستفيد من المطعم', `تم إضافة التلميذ ${student.firstName} ${student.lastName} كمستفيد من المطعم`);
        
        return cafeteriaUser;
    },

    // إلغاء تسجيل مستفيد من المطعم
    removeCafeteriaUser: function(studentId) {
        const index = this.data.cafeteriaUsers.findIndex(user => user.studentId === studentId);
        
        if (index !== -1) {
            const student = this.getStudentById(studentId);
            this.data.cafeteriaUsers.splice(index, 1);
            localStorage.setItem('cafeteriaUsers', JSON.stringify(this.data.cafeteriaUsers));
            
            // إضافة نشاط إذا كان التلميذ موجوداً
            if (student) {
                App.addActivity('إلغاء مستفيد من المطعم', `تم إلغاء استفادة التلميذ ${student.firstName} ${student.lastName} من المطعم`);
            }
            
            return true;
        }
        
        return false;
    },

    // الحصول على جميع المستفيدين من المطعم
    getAllCafeteriaUsers: function() {
        // إرجاع المستفيدين مع بيانات التلاميذ
        return this.data.cafeteriaUsers.map(user => {
            const student = this.getStudentById(user.studentId);
            return {
                ...user,
                student: student
            };
        });
    },

    // الحصول على عدد المستفيدين من المطعم
    getCafeteriaUsersCount: function() {
        return this.data.cafeteriaUsers.length;
    },

    // إضافة مصروف للمطعم
    addCafeteriaExpense: function(expense) {
        expense.id = this.generateId();
        expense.date = expense.date || new Date().toISOString();
        
        this.data.cafeteriaExpenses.push(expense);
        localStorage.setItem('cafeteriaExpenses', JSON.stringify(this.data.cafeteriaExpenses));
        
        // إضافة نشاط
        App.addActivity('إضافة مصروف للمطعم', `تم إضافة مصروف جديد للمطعم بقيمة ${expense.amount} دج`);
        
        return expense;
    },

    // إضافة مدخول للمطعم
    addCafeteriaIncome: function(income) {
        income.id = this.generateId();
        income.date = income.date || new Date().toISOString();
        
        this.data.cafeteriaIncome.push(income);
        localStorage.setItem('cafeteriaIncome', JSON.stringify(this.data.cafeteriaIncome));
        
        // إضافة نشاط
        App.addActivity('إضافة مدخول للمطعم', `تم إضافة مدخول جديد للمطعم بقيمة ${income.amount} دج`);
        
        return income;
    },

    // الحصول على جميع مصاريف المطعم
    getAllCafeteriaExpenses: function() {
        return [...this.data.cafeteriaExpenses];
    },

    // الحصول على جميع مدخولات المطعم
    getAllCafeteriaIncome: function() {
        return [...this.data.cafeteriaIncome];
    },

    // حساب إجمالي مصاريف المطعم
    getTotalCafeteriaExpenses: function() {
        return this.data.cafeteriaExpenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    },

    // حساب إجمالي مدخولات المطعم
    getTotalCafeteriaIncome: function() {
        return this.data.cafeteriaIncome.reduce((total, income) => total + parseFloat(income.amount), 0);
    },

    // حساب رصيد المطعم
    getCafeteriaBalance: function() {
        const totalIncome = this.getTotalCafeteriaIncome();
        const totalExpenses = this.getTotalCafeteriaExpenses();
        return totalIncome - totalExpenses;
    },

    // ===== وظائف مساعدة =====
    
    // توليد معرف فريد
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // تصدير البيانات
    exportData: function() {
        const exportData = {
            students: this.data.students,
            teachers: this.data.teachers,
            cafeteriaWorkers: this.data.cafeteriaWorkers,
            cafeteriaUsers: this.data.cafeteriaUsers,
            cafeteriaExpenses: this.data.cafeteriaExpenses,
            cafeteriaIncome: this.data.cafeteriaIncome,
            schoolInfo: App.state.schoolInfo,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileName = `school_data_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        // إضافة نشاط
        App.addActivity('تصدير البيانات', 'تم تصدير جميع بيانات المنصة');
    },

    // استيراد البيانات
    importData: function(file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // التحقق من صحة البيانات
                if (!importedData.students || !importedData.teachers) {
                    throw new Error('ملف البيانات غير صالح');
                }
                
                // استيراد البيانات
                this.data.students = importedData.students || [];
                this.data.teachers = importedData.teachers || [];
                this.data.cafeteriaWorkers = importedData.cafeteriaWorkers || [];
                this.data.cafeteriaUsers = importedData.cafeteriaUsers || [];
                this.data.cafeteriaExpenses = importedData.cafeteriaExpenses || [];
                this.data.cafeteriaIncome = importedData.cafeteriaIncome || [];
                
                // حفظ البيانات في التخزين المحلي
                this.saveAllData();
                
                // استيراد معلومات المدرسة إذا كانت موجودة
                if (importedData.schoolInfo) {
                    App.saveSchoolInfo(importedData.schoolInfo);
                }
                
                // إضافة نشاط
                App.addActivity('استيراد البيانات', 'تم استيراد البيانات بنجاح');
                
                // تحديث واجهة المستخدم
                App.updateDashboard();
                
                // عرض إشعار نجاح
                UI.showNotification('تم استيراد البيانات بنجاح', 'success');
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                UI.showNotification('حدث خطأ أثناء استيراد البيانات', 'error');
            }
        };
        
        reader.readAsText(file);
    },

    // إعادة تعيين البيانات
    resetData: function() {
        // حذف جميع البيانات من التخزين المحلي
        localStorage.removeItem('students');
        localStorage.removeItem('teachers');
        localStorage.removeItem('cafeteriaWorkers');
        localStorage.removeItem('cafeteriaUsers');
        localStorage.removeItem('cafeteriaExpenses');
        localStorage.removeItem('cafeteriaIncome');
        localStorage.removeItem('lastActivities');
        
        // إعادة تعيين البيانات في الذاكرة
        this.data.students = [];
        this.data.teachers = [];
        this.data.cafeteriaWorkers = [];
        this.data.cafeteriaUsers = [];
        this.data.cafeteriaExpenses = [];
        this.data.cafeteriaIncome = [];
        
        // إعادة تعيين الأنشطة
        App.state.lastActivities = [];
        
        // إضافة نشاط
        App.addActivity('إعادة تعيين البيانات', 'تم حذف جميع البيانات وإعادة تعيين المنصة');
    }
};