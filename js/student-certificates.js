/**
 * نظام إدارة شهادات وتقارير التلاميذ
 * يتضمن شهادات النجاح، شهادات التكريم، تقارير الأداء، واستدعاءات أولياء الأمور
 */

// المتغيرات العامة
let certificateTemplates = [];
let studentCertificates = [];
let parentSummons = [];

// تهيئة صفحة الشهادات والتقارير
function initStudentCertificatesPage() {
    console.log("تهيئة صفحة شهادات وتقارير التلاميذ");
    
    // تحميل البيانات من التخزين المحلي
    loadCertificatesData();
    
    // عرض البيانات في الجداول
    renderCertificateTemplates();
    renderStudentCertificates();
    renderParentSummons();
    
    // إضافة مستمعي الأحداث للأزرار
    setupCertificatesEventListeners();
}

// تحميل بيانات الشهادات من التخزين المحلي
function loadCertificatesData() {
    certificateTemplates = JSON.parse(localStorage.getItem('certificateTemplates')) || getDefaultTemplates();
    studentCertificates = JSON.parse(localStorage.getItem('studentCertificates')) || [];
    parentSummons = JSON.parse(localStorage.getItem('parentSummons')) || [];
}

// حفظ بيانات الشهادات في التخزين المحلي
function saveCertificatesData() {
    localStorage.setItem('certificateTemplates', JSON.stringify(certificateTemplates));
    localStorage.setItem('studentCertificates', JSON.stringify(studentCertificates));
    localStorage.setItem('parentSummons', JSON.stringify(parentSummons));
}

// إعداد مستمعي الأحداث
function setupCertificatesEventListeners() {
    // أزرار الإضافة
    document.getElementById('add-certificate-template-btn').addEventListener('click', showAddTemplateModal);
    document.getElementById('create-student-certificate-btn').addEventListener('click', showCreateCertificateModal);
    document.getElementById('create-parent-summon-btn').addEventListener('click', showCreateSummonModal);
    
    // أزرار التصفية
    document.getElementById('filter-certificates-btn').addEventListener('click', filterCertificates);
    document.getElementById('reset-certificates-filter-btn').addEventListener('click', resetCertificatesFilter);
}

// الحصول على قوالب الشهادات الافتراضية
function getDefaultTemplates() {
    return [
        {
            id: generateId(),
            name: "شهادة تفوق",
            type: "تكريم",
            borderStyle: "elegant-gold",
            backgroundColor: "#FFFDF0",
            textColor: "#8B4513",
            fontFamily: "Amiri, serif",
            headerText: "شهادة تكريم وتقدير",
            bodyTemplate: "تمنح هذه الشهادة للتلميذ(ة) {studentName} من قسم {className} لتفوقه(ها) الدراسي وحصوله(ها) على معدل {average} خلال {term}.",
            footerText: "مع تمنياتنا بمزيد من التفوق والنجاح",
            minGrade: 16,
            maxGrade: 20,
            imageUrl: "assets/images/certificates/gold-medal.png"
        },
        {
            id: generateId(),
            name: "شهادة تشجيع",
            type: "تكريم",
            borderStyle: "elegant-silver",
            backgroundColor: "#F8F8FF",
            textColor: "#2F4F4F",
            fontFamily: "Cairo, sans-serif",
            headerText: "شهادة تشجيعية",
            bodyTemplate: "نشجع التلميذ(ة) {studentName} من قسم {className} على مجهوداته(ها) وحصوله(ها) على معدل {average} خلال {term}.",
            footerText: "استمر في العمل الجاد",
            minGrade: 12,
            maxGrade: 15.99,
            imageUrl: "assets/images/certificates/silver-medal.png"
        },
        {
            id: generateId(),
            name: "شهادة نجاح",
            type: "نجاح",
            borderStyle: "classic-blue",
            backgroundColor: "#F0F8FF",
            textColor: "#000080",
            fontFamily: "Tajawal, sans-serif",
            headerText: "شهادة نجاح",
            bodyTemplate: "نشهد أن التلميذ(ة) {studentName} قد نجح(ت) إلى المستوى {nextLevel} بمعدل {average} للسنة الدراسية {schoolYear}.",
            footerText: "نتمنى لك التوفيق في مسارك الدراسي",
            minGrade: 10,
            maxGrade: 20,
            imageUrl: "assets/images/certificates/diploma.png"
        },
        {
            id: generateId(),
            name: "استدعاء ولي أمر",
            type: "استدعاء",
            borderStyle: "official-red",
            backgroundColor: "#FFF5F5",
            textColor: "#8B0000",
            fontFamily: "Tajawal, sans-serif",
            headerText: "استدعاء ولي أمر",
            bodyTemplate: "يرجى من السيد(ة) ولي أمر التلميذ(ة) {studentName} من قسم {className} الحضور إلى المؤسسة يوم {meetingDate} على الساعة {meetingTime} للقاء {teacherName} بخصوص {reason}.",
            footerText: "نشكركم على تعاونكم",
            minGrade: 0,
            maxGrade: 20,
            imageUrl: "assets/images/certificates/notice.png"
        }
    ];
}

// عرض قوالب الشهادات
function renderCertificateTemplates() {
    const tableBody = document.getElementById('certificate-templates-list');
    tableBody.innerHTML = '';
    
    if (certificateTemplates.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد قوالب شهادات</td></tr>';
        return;
    }
    
    certificateTemplates.forEach((template, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${template.name}</td>
            <td>${template.type}</td>
            <td>${template.minGrade} - ${template.maxGrade}</td>
            <td>
                <div class="certificate-preview" style="
                    border: 5px solid ${getBorderColor(template.borderStyle)};
                    background-color: ${template.backgroundColor};
                    color: ${template.textColor};
                    font-family: ${template.fontFamily};
                    padding: 5px;
                    text-align: center;
                    height: 50px;
                    overflow: hidden;
                ">
                    ${template.headerText}
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-info edit-template" data-id="${template.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-template" data-id="${template.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-sm btn-success preview-template" data-id="${template.id}"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.edit-template').forEach(btn => {
        btn.addEventListener('click', () => editCertificateTemplate(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-template').forEach(btn => {
        btn.addEventListener('click', () => deleteCertificateTemplate(btn.dataset.id));
    });
    
    document.querySelectorAll('.preview-template').forEach(btn => {
        btn.addEventListener('click', () => previewCertificateTemplate(btn.dataset.id));
    });
}

// الحصول على لون الإطار حسب النمط
function getBorderColor(borderStyle) {
    switch (borderStyle) {
        case 'elegant-gold': return '#FFD700';
        case 'elegant-silver': return '#C0C0C0';
        case 'classic-blue': return '#4169E1';
        case 'official-red': return '#B22222';
        case 'green-success': return '#2E8B57';
        case 'purple-excellence': return '#800080';
        default: return '#000000';
    }
}

// عرض شهادات التلاميذ
function renderStudentCertificates() {
    const tableBody = document.getElementById('student-certificates-list');
    tableBody.innerHTML = '';
    
    if (studentCertificates.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد شهادات مصدرة</td></tr>';
        return;
    }
    
    // ترتيب الشهادات حسب التاريخ (الأحدث أولاً)
    const sortedCertificates = [...studentCertificates].sort((a, b) => 
        new Date(b.issueDate) - new Date(a.issueDate)
    );
    
    sortedCertificates.forEach((certificate, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${certificate.studentName}</td>
            <td>${certificate.className}</td>
            <td>${certificate.templateName}</td>
            <td>${formatDate(certificate.issueDate)}</td>
            <td>${certificate.average}</td>
            <td>
                <button class="btn btn-sm btn-success print-certificate" data-id="${certificate.id}"><i class="fas fa-print"></i></button>
                <button class="btn btn-sm btn-info edit-certificate" data-id="${certificate.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-certificate" data-id="${certificate.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.print-certificate').forEach(btn => {
        btn.addEventListener('click', () => printStudentCertificate(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-certificate').forEach(btn => {
        btn.addEventListener('click', () => editStudentCertificate(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-certificate').forEach(btn => {
        btn.addEventListener('click', () => deleteStudentCertificate(btn.dataset.id));
    });
}

// عرض استدعاءات أولياء الأمور
function renderParentSummons() {
    const tableBody = document.getElementById('parent-summons-list');
    tableBody.innerHTML = '';
    
    if (parentSummons.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد استدعاءات</td></tr>';
        return;
    }
    
    // ترتيب الاستدعاءات حسب التاريخ (الأحدث أولاً)
    const sortedSummons = [...parentSummons].sort((a, b) => 
        new Date(b.issueDate) - new Date(a.issueDate)
    );
    
    sortedSummons.forEach((summon, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${summon.studentName}</td>
            <td>${summon.className}</td>
            <td>${formatDate(summon.meetingDate)} ${summon.meetingTime}</td>
            <td>${summon.reason}</td>
            <td>
                <button class="btn btn-sm btn-success print-summon" data-id="${summon.id}"><i class="fas fa-print"></i></button>
                <button class="btn btn-sm btn-info edit-summon" data-id="${summon.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-summon" data-id="${summon.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.print-summon').forEach(btn => {
        btn.addEventListener('click', () => printParentSummon(btn.dataset.id));
    });
    
    document.querySelectorAll('.edit-summon').forEach(btn => {
        btn.addEventListener('click', () => editParentSummon(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-summon').forEach(btn => {
        btn.addEventListener('click', () => deleteParentSummon(btn.dataset.id));
    });
}

// إضافة قالب شهادة جديد
function showAddTemplateModal() {
    // إنشاء النافذة المنبثقة
    const modal = createModal('إضافة قالب شهادة جديد', `
        <form id="add-template-form">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="template-name" class="form-label">اسم القالب</label>
                        <input type="text" class="form-control" id="template-name" required>
                    </div>
                    <div class="mb-3">
                        <label for="template-type" class="form-label">نوع الشهادة</label>
                        <select class="form-select" id="template-type" required>
                            <option value="تكريم">شهادة تكريم</option>
                            <option value="نجاح">شهادة نجاح</option>
                            <option value="مشاركة">شهادة مشاركة</option>
                            <option value="استدعاء">استدعاء ولي أمر</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="template-border" class="form-label">نمط الإطار</label>
                        <select class="form-select" id="template-border" required>
                            <option value="elegant-gold">ذهبي أنيق</option>
                            <option value="elegant-silver">فضي أنيق</option>
                            <option value="classic-blue">أزرق كلاسيكي</option>
                            <option value="official-red">أحمر رسمي</option>
                            <option value="green-success">أخضر النجاح</option>
                            <option value="purple-excellence">بنفسجي التميز</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="template-background" class="form-label">لون الخلفية</label>
                        <input type="color" class="form-control" id="template-background" value="#FFFDF0">
                    </div>
                    <div class="mb-3">
                        <label for="template-text-color" class="form-label">لون النص</label>
                        <input type="color" class="form-control" id="template-text-color" value="#000000">
                    </div>
                    <div class="mb-3">
                        <label for="template-font" class="form-label">نوع الخط</label>
                        <select class="form-select" id="template-font" required>
                            <option value="Amiri, serif">Amiri</option>
                            <option value="Cairo, sans-serif">Cairo</option>
                            <option value="Tajawal, sans-serif">Tajawal</option>
                            <option value="Scheherazade New, serif">Scheherazade</option>
                            <option value="Noto Kufi Arabic, sans-serif">Noto Kufi</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="template-header" class="form-label">نص الترويسة</label>
                        <input type="text" class="form-control" id="template-header" required>
                    </div>
                    <div class="mb-3">
                        <label for="template-body" class="form-label">نص الشهادة</label>
                        <textarea class="form-control" id="template-body" rows="4" required></textarea>
                        <small class="form-text text-muted">استخدم {studentName}، {className}، {average}، {term}، {schoolYear}، {nextLevel}، {meetingDate}، {meetingTime}، {teacherName}، {reason} كمتغيرات.</small>
                    </div>
                    <div class="mb-3">
                        <label for="template-footer" class="form-label">نص التذييل</label>
                        <input type="text" class="form-control" id="template-footer" required>
                    </div>
                    <div class="mb-3">
                        <label for="template-min-grade" class="form-label">الحد الأدنى للمعدل</label>
                        <input type="number" class="form-control" id="template-min-grade" min="0" max="20" step="0.01" value="0" required>
                    </div>
                    <div class="mb-3">
                        <label for="template-max-grade" class="form-label">الحد الأقصى للمعدل</label>
                        <input type="number" class="form-control" id="template-max-grade" min="0" max="20" step="0.01" value="20" required>
                    </div>
                    <div class="mb-3">
                        <label for="template-image" class="form-label">رابط الصورة (اختياري)</label>
                        <input type="text" class="form-control" id="template-image" placeholder="assets/images/certificates/medal.png">
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div id="template-preview" class="p-4 text-center" style="border: 5px solid #FFD700; background-color: #FFFDF0;">
                    <h3>معاينة الشهادة</h3>
                    <p>هنا سيظهر شكل الشهادة حسب الإعدادات المختارة</p>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">حفظ القالب</button>
        </form>
    `);
    
    // تحديث المعاينة عند تغيير الإعدادات
    const updatePreview = () => {
        const preview = document.getElementById('template-preview');
        const borderStyle = document.getElementById('template-border').value;
        const backgroundColor = document.getElementById('template-background').value;
        const textColor = document.getElementById('template-text-color').value;
        const fontFamily = document.getElementById('template-font').value;
        const headerText = document.getElementById('template-header').value || 'عنوان الشهادة';
        const bodyText = document.getElementById('template-body').value || 'نص الشهادة يظهر هنا';
        const footerText = document.getElementById('template-footer').value || 'تذييل الشهادة';
        
        preview.style.border = `5px solid ${getBorderColor(borderStyle)}`;
        preview.style.backgroundColor = backgroundColor;
        preview.style.color = textColor;
        preview.style.fontFamily = fontFamily;
        
        preview.innerHTML = `
            <h3 style="margin-bottom: 20px;">${headerText}</h3>
            <p style="margin-bottom: 20px;">${bodyText.replace(/{(\w+)}/g, '...')}</p>
            <p>${footerText}</p>
        `;
    };
    
    // إضافة مستمعي الأحداث لتحديث المعاينة
    document.getElementById('template-border').addEventListener('change', updatePreview);
    document.getElementById('template-background').addEventListener('input', updatePreview);
    document.getElementById('template-text-color').addEventListener('input', updatePreview);
    document.getElementById('template-font').addEventListener('change', updatePreview);
    document.getElementById('template-header').addEventListener('input', updatePreview);
    document.getElementById('template-body').addEventListener('input', updatePreview);
    document.getElementById('template-footer').addEventListener('input', updatePreview);
    
    // تحديث المعاينة الأولية
    updatePreview();
    
    // معالجة إرسال النموذج
    document.getElementById('add-template-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newTemplate = {
            id: generateId(),
            name: document.getElementById('template-name').value,
            type: document.getElementById('template-type').value,
            borderStyle: document.getElementById('template-border').value,
            backgroundColor: document.getElementById('template-background').value,
            textColor: document.getElementById('template-text-color').value,
            fontFamily: document.getElementById('template-font').value,
            headerText: document.getElementById('template-header').value,
            bodyTemplate: document.getElementById('template-body').value,
            footerText: document.getElementById('template-footer').value,
            minGrade: parseFloat(document.getElementById('template-min-grade').value),
            maxGrade: parseFloat(document.getElementById('template-max-grade').value),
            imageUrl: document.getElementById('template-image').value || null
        };
        
        certificateTemplates.push(newTemplate);
        saveCertificatesData();
        renderCertificateTemplates();
        
        // إضافة نشاط جديد
        addActivity('إضافة قالب شهادة', `تم إضافة قالب شهادة جديد: ${newTemplate.name}`);
        
        // إغلاق النافذة المنبثقة
        closeModal();
        
        // عرض رسالة نجاح
        showAlert('تم إضافة قالب الشهادة بنجاح', 'success');
    });
}

// إنشاء شهادة لتلميذ
function showCreateCertificateModal() {
    // الحصول على قائمة التلاميذ والفصول
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const classes = JSON.parse(localStorage.getItem('classes')) || [];
    
    if (students.length === 0) {
        showAlert('لا يوجد تلاميذ مسجلين في النظام', 'warning');
        return;
    }
    
    if (certificateTemplates.length === 0) {
        showAlert('لا توجد قوالب شهادات متاحة', 'warning');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = createModal('إنشاء شهادة لتلميذ', `
        <form id="create-certificate-form">
            <div class="mb-3">
                <label for="certificate-student" class="form-label">التلميذ</label>
                <select class="form-select" id="certificate-student" required>
                    <option value="">اختر التلميذ</option>
                    ${students.map(student => `<option value="${student.id}" data-class="${student.classId}">${student.firstName} ${student.lastName}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="certificate-class" class="form-label">الفصل</label>
                <select class="form-select" id="certificate-class" required>
                    <option value="">اختر الفصل</option>
                    ${classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="certificate-template" class="form-label">قالب الشهادة</label>
                <select class="form-select" id="certificate-template" required>
                    <option value="">اختر القالب</option>
                    ${certificateTemplates.map(template => `<option value="${template.id}">${template.name} (${template.type})</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="certificate-average" class="form-label">المعدل</label>
                <input type="number" class="form-control" id="certificate-average" min="0" max="20" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="certificate-term" class="form-label">الفصل الدراسي</label>
                <select class="form-select" id="certificate-term" required>
                    <option value="الفصل الأول">الفصل الأول</option>
                    <option value="الفصل الثاني">الفصل الثاني</option>
                    <option value="الفصل الثالث">الفصل الثالث</option>
                    <option value="السنة الدراسية">السنة الدراسية</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="certificate-school-year" class="form-label">السنة الدراسية</label>
                <input type="text" class="form-control" id="certificate-school-year" value="${getCurrentSchoolYear()}" required>
            </div>
            <div class="mb-3">
                <label for="certificate-next-level" class="form-label">المستوى التالي (للنجاح)</label>
                <input type="text" class="form-control" id="certificate-next-level">
            </div>
            <div class="mb-3">
                <label for="certificate-issue-date" class="form-label">تاريخ الإصدار</label>
                <input type="date" class="form-control" id="certificate-issue-date" required>
            </div>
            <div class="mb-3">
                <div id="certificate-preview" class="p-4 text-center" style="border: 5px solid #FFD700; background-color: #FFFDF0;">
                    <h3>معاينة الشهادة</h3>
                    <p>اختر قالب الشهادة والتلميذ لمعاينة الشهادة</p>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">إنشاء الشهادة</button>
        </form>
    `);
    
    // تعيين التاريخ الحالي كتاريخ الإصدار الافتراضي
    document.getElementById('certificate-issue-date').value = new Date().toISOString().split('T')[0];
    
    // تحديث الفصل عند اختيار التلميذ
    document.getElementById('certificate-student').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const classId = selectedOption.dataset.class;
        
        if (classId) {
            document.getElementById('certificate-class').value = classId;
        }
    });
    
    // تحديث المعاينة عند اختيار القالب
    document.getElementById('certificate-template').addEventListener('change', updateCertificatePreview);
    document.getElementById('certificate-student').addEventListener('change', updateCertificatePreview);
    document.getElementById('certificate-class').addEventListener('change', updateCertificatePreview);
    document.getElementById('certificate-average').addEventListener('input', updateCertificatePreview);
    document.getElementById('certificate-term').addEventListener('change', updateCertificatePreview);
    document.getElementById('certificate-school-year').addEventListener('input', updateCertificatePreview);
    document.getElementById('certificate-next-level').addEventListener('input', updateCertificatePreview);
    
    function updateCertificatePreview() {
        const templateId = document.getElementById('certificate-template').value;
        if (!templateId) return;
        
        const template = certificateTemplates.find(t => t.id === templateId);
        if (!template) return;
        
        const studentSelect = document.getElementById('certificate-student');
        const studentName = studentSelect.options[studentSelect.selectedIndex]?.text || '{اسم التلميذ}';
        
        const classSelect = document.getElementById('certificate-class');
        const className = classSelect.options[classSelect.selectedIndex]?.text || '{الفصل}';
        
        const average = document.getElementById('certificate-average').value || '{المعدل}';
        const term = document.getElementById('certificate-term').value || '{الفصل الدراسي}';
        const schoolYear = document.getElementById('certificate-school-year').value || '{السنة الدراسية}';
        const nextLevel = document.getElementById('certificate-next-level').value || '{المستوى التالي}';
        
        const preview = document.getElementById('certificate-preview');
        preview.style.border = `5px solid ${getBorderColor(template.borderStyle)}`;
        preview.style.backgroundColor = template.backgroundColor;
        preview.style.color = template.