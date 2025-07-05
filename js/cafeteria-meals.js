/**
 * نظام إدارة الوجبات الغذائية للمطعم المدرسي
 * يتضمن إدارة المواد الغذائية، حساب تكلفة الوجبات، وإنشاء التقارير
 */

// المتغيرات العامة
let foodIngredients = [];
let dailyMeals = [];
let foodReceipts = [];
let foodDeliveries = [];
let studentsCount = 0;
let absentStudentsCount = 0;

// دوال مساعدة
// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ');
}

// إنشاء معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// إضافة نشاط جديد
function addActivity(type, description) {
    // التحقق من وجود دالة App.addActivity
    if (typeof App !== 'undefined' && typeof App.addActivity === 'function') {
        App.addActivity(type, description);
    } else {
        console.log(`نشاط جديد: ${type} - ${description}`);
    }
}

// إنشاء نافذة منبثقة
function createModal(title, content) {
    // التحقق من وجود دالة UI.createModal
    if (typeof UI !== 'undefined' && typeof UI.createModal === 'function') {
        return UI.createModal({
            id: 'cafeteria-meals-modal',
            title: title,
            content: content
        });
    } else {
        // إنشاء نافذة منبثقة بسيطة
        const modalDiv = document.createElement('div');
        modalDiv.id = 'cafeteria-meals-modal';
        modalDiv.className = 'modal fade show';
        modalDiv.style.display = 'block';
        modalDiv.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" onclick="closeModal()"></button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
        return modalDiv;
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    // التحقق من وجود دالة UI.closeModal
    if (typeof UI !== 'undefined' && typeof UI.closeModal === 'function') {
        UI.closeModal('cafeteria-meals-modal');
    } else {
        const modal = document.getElementById('cafeteria-meals-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// عرض رسالة تنبيه
function showAlert(message, type) {
    // التحقق من وجود دالة UI.showNotification
    if (typeof UI !== 'undefined' && typeof UI.showNotification === 'function') {
        UI.showNotification(message, type);
    } else {
        alert(message);
    }
}

// تهيئة صفحة إدارة الوجبات
function initCafeteriaMealsPage() {
    console.log("تهيئة صفحة إدارة الوجبات الغذائية");
    
    // تحميل البيانات من التخزين المحلي
    loadCafeteriaMealsData();
    
    // عرض البيانات في الجداول
    renderFoodIngredients();
    renderDailyMeals();
    renderFoodReceipts();
    renderFoodDeliveries();
    
    // تحديث الإحصائيات
    updateCafeteriaMealsStats();
    
    // التحقق من وجود مكتبة Chart.js قبل إنشاء الرسوم البيانية
    if (typeof Chart !== 'undefined') {
        // إنشاء الرسوم البيانية
        createMealCostChart();
        createIngredientUsageChart();
    } else {
        console.error('مكتبة Chart.js غير متوفرة. لا يمكن إنشاء الرسوم البيانية.');
    }
    
    // إضافة مستمعي الأحداث للأزرار
    setupCafeteriaMealsEventListeners();
}

// باقي الكود يبقى كما هو...
function loadCafeteriaMealsData() {
    foodIngredients = JSON.parse(localStorage.getItem('foodIngredients')) || [];
    dailyMeals = JSON.parse(localStorage.getItem('dailyMeals')) || [];
    foodReceipts = JSON.parse(localStorage.getItem('foodReceipts')) || [];
    foodDeliveries = JSON.parse(localStorage.getItem('foodDeliveries')) || [];
    studentsCount = parseInt(localStorage.getItem('studentsCount')) || 0;
    absentStudentsCount = parseInt(localStorage.getItem('absentStudentsCount')) || 0;
}

// حفظ بيانات الوجبات في التخزين المحلي
function saveCafeteriaMealsData() {
    localStorage.setItem('foodIngredients', JSON.stringify(foodIngredients));
    localStorage.setItem('dailyMeals', JSON.stringify(dailyMeals));
    localStorage.setItem('foodReceipts', JSON.stringify(foodReceipts));
    localStorage.setItem('foodDeliveries', JSON.stringify(foodDeliveries));
    localStorage.setItem('studentsCount', studentsCount.toString());
    localStorage.setItem('absentStudentsCount', absentStudentsCount.toString());
    
    // تحديث الإحصائيات
    updateCafeteriaMealsStats();
}

// إعداد مستمعي الأحداث
function setupCafeteriaMealsEventListeners() {
    // أزرار الإضافة
    document.getElementById('add-ingredient-btn').addEventListener('click', showAddIngredientModal);
    document.getElementById('add-daily-meal-btn').addEventListener('click', showAddDailyMealModal);
    document.getElementById('add-food-receipt-btn').addEventListener('click', showAddFoodReceiptModal);
    document.getElementById('add-food-delivery-btn').addEventListener('click', showAddFoodDeliveryModal);
    document.getElementById('update-students-count-btn').addEventListener('click', showUpdateStudentsCountModal);
    document.getElementById('print-meal-report-btn').addEventListener('click', printMealReport);
    document.getElementById('print-receipt-btn').addEventListener('click', printReceiptTemplate);
    document.getElementById('print-delivery-btn').addEventListener('click', printDeliveryTemplate);
    
    // تعيين التاريخ الحالي لحقول التاريخ
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.value = today;
    });
}

// عرض المواد الغذائية
function renderFoodIngredients() {
    const tableBody = document.getElementById('food-ingredients-list');
    tableBody.innerHTML = '';
    
    if (foodIngredients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد مواد غذائية مسجلة</td></tr>';
        return;
    }
    
    foodIngredients.forEach((ingredient, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${ingredient.name}</td>
            <td>${ingredient.unit}</td>
            <td>${ingredient.price.toFixed(2)} دج</td>
            <td>${ingredient.quantity.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-info edit-ingredient" data-id="${ingredient.id}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-ingredient" data-id="${ingredient.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-sm btn-success add-stock" data-id="${ingredient.id}"><i class="fas fa-plus"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.edit-ingredient').forEach(btn => {
        btn.addEventListener('click', () => editIngredient(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-ingredient').forEach(btn => {
        btn.addEventListener('click', () => deleteIngredient(btn.dataset.id));
    });
    
    document.querySelectorAll('.add-stock').forEach(btn => {
        btn.addEventListener('click', () => addIngredientStock(btn.dataset.id));
    });
}

// عرض الوجبات اليومية
function renderDailyMeals() {
    const tableBody = document.getElementById('daily-meals-list');
    tableBody.innerHTML = '';
    
    if (dailyMeals.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد وجبات مسجلة</td></tr>';
        return;
    }
    
    // ترتيب الوجبات حسب التاريخ (الأحدث أولاً)
    const sortedMeals = [...dailyMeals].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedMeals.forEach((meal, index) => {
        const row = document.createElement('tr');
        
        // حساب عدد الطلاب الفعليين
        const actualStudents = meal.studentsCount - meal.absentStudents;
        
        row.innerHTML = `
            <td>${formatDate(meal.date)}</td>
            <td>${meal.name}</td>
            <td>${meal.totalCost.toFixed(2)} دج</td>
            <td>${meal.studentsCount}</td>
            <td>${meal.absentStudents}</td>
            <td>${(meal.totalCost / actualStudents).toFixed(2)} دج</td>
            <td>
                <button class="btn btn-sm btn-info view-meal" data-id="${meal.id}"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-danger delete-meal" data-id="${meal.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-sm btn-primary print-meal" data-id="${meal.id}"><i class="fas fa-print"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.view-meal').forEach(btn => {
        btn.addEventListener('click', () => viewMealDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-meal').forEach(btn => {
        btn.addEventListener('click', () => deleteMeal(btn.dataset.id));
    });
    
    document.querySelectorAll('.print-meal').forEach(btn => {
        btn.addEventListener('click', () => printMealDetails(btn.dataset.id));
    });
}

// عرض وصولات استلام المواد الغذائية
function renderFoodReceipts() {
    const tableBody = document.getElementById('food-receipts-list');
    tableBody.innerHTML = '';
    
    if (foodReceipts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد وصولات استلام مسجلة</td></tr>';
        return;
    }
    
    // ترتيب الوصولات حسب التاريخ (الأحدث أولاً)
    const sortedReceipts = [...foodReceipts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedReceipts.forEach((receipt, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${receipt.receiptNumber}</td>
            <td>${formatDate(receipt.date)}</td>
            <td>${receipt.supplier}</td>
            <td>${receipt.items.length}</td>
            <td>${receipt.totalAmount.toFixed(2)} دج</td>
            <td>
                <button class="btn btn-sm btn-info view-receipt" data-id="${receipt.id}"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-danger delete-receipt" data-id="${receipt.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-sm btn-primary print-receipt" data-id="${receipt.id}"><i class="fas fa-print"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.view-receipt').forEach(btn => {
        btn.addEventListener('click', () => viewReceiptDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-receipt').forEach(btn => {
        btn.addEventListener('click', () => deleteReceipt(btn.dataset.id));
    });
    
    document.querySelectorAll('.print-receipt').forEach(btn => {
        btn.addEventListener('click', () => printReceiptDetails(btn.dataset.id));
    });
}

// عرض وصولات تسليم المواد الغذائية
function renderFoodDeliveries() {
    const tableBody = document.getElementById('food-deliveries-list');
    tableBody.innerHTML = '';
    
    if (foodDeliveries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد وصولات تسليم مسجلة</td></tr>';
        return;
    }
    
    // ترتيب الوصولات حسب التاريخ (الأحدث أولاً)
    const sortedDeliveries = [...foodDeliveries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedDeliveries.forEach((delivery, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${delivery.deliveryNumber}</td>
            <td>${formatDate(delivery.date)}</td>
            <td>${delivery.recipient}</td>
            <td>${delivery.items.length}</td>
            <td>${delivery.purpose}</td>
            <td>
                <button class="btn btn-sm btn-info view-delivery" data-id="${delivery.id}"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-danger delete-delivery" data-id="${delivery.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-sm btn-primary print-delivery" data-id="${delivery.id}"><i class="fas fa-print"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.view-delivery').forEach(btn => {
        btn.addEventListener('click', () => viewDeliveryDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-delivery').forEach(btn => {
        btn.addEventListener('click', () => deleteDelivery(btn.dataset.id));
    });
    
    document.querySelectorAll('.print-delivery').forEach(btn => {
        btn.addEventListener('click', () => printDeliveryDetails(btn.dataset.id));
    });
}

// تحديث إحصائيات الوجبات
function updateCafeteriaMealsStats() {
    // تحديث عدد المواد الغذائية
    document.getElementById('total-ingredients').textContent = foodIngredients.length;
    
    // تحديث إجمالي قيمة المخزون
    const totalStock = foodIngredients.reduce((total, ingredient) => {
        return total + (ingredient.price * ingredient.quantity);
    }, 0);
    document.getElementById('total-stock-value').textContent = totalStock.toFixed(2) + ' دج';
    
    // تحديث متوسط تكلفة الوجبة
    if (dailyMeals.length > 0) {
        const lastWeekMeals = getLastWeekMeals();
        const avgCost = lastWeekMeals.reduce((total, meal) => {
            const actualStudents = meal.studentsCount - meal.absentStudents;
            return total + (meal.totalCost / actualStudents);
        }, 0) / lastWeekMeals.length;
        
        document.getElementById('avg-meal-cost').textContent = avgCost.toFixed(2) + ' دج';
    } else {
        document.getElementById('avg-meal-cost').textContent = '0.00 دج';
    }
    
    // تحديث عدد الطلاب
    document.getElementById('total-students').textContent = studentsCount;
    document.getElementById('absent-students').textContent = absentStudentsCount;
    
    // تحديث نسبة الحضور
    const attendanceRate = studentsCount > 0 ? 
        Math.round(((studentsCount - absentStudentsCount) / studentsCount) * 100) : 0;
    document.getElementById('attendance-rate').textContent = attendanceRate + '%';
}

// الحصول على وجبات الأسبوع الأخير
function getLastWeekMeals() {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    return dailyMeals.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate >= lastWeek && mealDate <= today;
    });
}

// إنشاء رسم بياني لتكلفة الوجبات
function createMealCostChart() {
    const ctx = document.getElementById('meal-cost-chart').getContext('2d');
    
    // الحصول على بيانات تكلفة الوجبات للأسبوع الأخير
    const lastWeekMeals = getLastWeekMeals();
    const dates = [];
    const costs = [];
    
    lastWeekMeals.forEach(meal => {
        dates.push(formatDate(meal.date));
        const actualStudents = meal.studentsCount - meal.absentStudents;
        costs.push((meal.totalCost / actualStudents).toFixed(2));
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'تكلفة الوجبة للطالب الواحد (دج)',
                data: costs,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'تكلفة الوجبات للأسبوع الأخير'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'التكلفة (دج)'
                    }
                }
            }
        }
    });
}

// إنشاء رسم بياني لاستخدام المواد الغذائية
function createIngredientUsageChart() {
    const ctx = document.getElementById('ingredient-usage-chart').getContext('2d');
    
    // الحصول على أكثر 5 مواد غذائية استخداماً
    const ingredientUsage = getTopIngredientsUsage();
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ingredientUsage.names,
            datasets: [{
                data: ingredientUsage.quantities,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'أكثر المواد الغذائية استخداماً'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// الحصول على أكثر 5 مواد غذائية استخداماً
function getTopIngredientsUsage() {
    // إنشاء قاموس لتتبع استخدام كل مادة غذائية
    const usage = {};
    
    // جمع استخدام المواد الغذائية من جميع الوجبات
    dailyMeals.forEach(meal => {
        meal.ingredients.forEach(item => {
            if (usage[item.name]) {
                usage[item.name] += item.quantity;
            } else {
                usage[item.name] = item.quantity;
            }
        });
    });
    
    // تحويل القاموس إلى مصفوفة وترتيبها تنازلياً
    const sortedUsage = Object.entries(usage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // أخذ أعلى 5 مواد
    
    // استخراج الأسماء والكميات
    const names = sortedUsage.map(item => item[0]);
    const quantities = sortedUsage.map(item => item[1]);
    
    return { names, quantities };
}

// إضافة مادة غذائية جديدة
function showAddIngredientModal() {
    // إنشاء النافذة المنبثقة
    const modal = createModal('إضافة مادة غذائية جديدة', `
        <form id="add-ingredient-form">
            <div class="mb-3">
                <label for="ingredient-name" class="form-label">اسم المادة الغذائية</label>
                <input type="text" class="form-control" id="ingredient-name" required>
            </div>
            <div class="mb-3">
                <label for="ingredient-unit" class="form-label">وحدة القياس</label>
                <select class="form-select" id="ingredient-unit" required>
                    <option value="">اختر وحدة القياس</option>
                    <option value="كغ">كيلوغرام (كغ)</option>
                    <option value="غ">غرام (غ)</option>
                    <option value="ل">لتر (ل)</option>
                    <option value="مل">ميليلتر (مل)</option>
                    <option value="قطعة">قطعة</option>
                    <option value="علبة">علبة</option>
                    <option value="كيس">كيس</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="ingredient-price" class="form-label">السعر (دج)</label>
                <input type="number" class="form-control" id="ingredient-price" min="0" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="ingredient-quantity" class="form-label">الكمية المتوفرة</label>
                <input type="number" class="form-control" id="ingredient-quantity" min="0" step="0.01" required>
            </div>
            <button type="submit" class="btn btn-primary">حفظ</button>
        </form>
    `);
    
    // معالجة إرسال النموذج
    document.getElementById('add-ingredient-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newIngredient = {
            id: generateId(),
            name: document.getElementById('ingredient-name').value,
            unit: document.getElementById('ingredient-unit').value,
            price: parseFloat(document.getElementById('ingredient-price').value),
            quantity: parseFloat(document.getElementById('ingredient-quantity').value)
        };
        
        foodIngredients.push(newIngredient);
        saveCafeteriaMealsData();
        renderFoodIngredients();
        
        // إضافة نشاط جديد
        addActivity('إضافة مادة غذائية', `تم إضافة مادة غذائية جديدة: ${newIngredient.name}`);
        
        // إغلاق النافذة المنبثقة
        closeModal();
        
        // عرض رسالة نجاح
        showAlert('تم إضافة المادة الغذائية بنجاح', 'success');
    });
}

// تعديل مادة غذائية
function editIngredient(ingredientId) {
    const ingredient = foodIngredients.find(i => i.id === ingredientId);
    if (!ingredient) {
        showAlert('لم يتم العثور على المادة الغذائية', 'danger');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = createModal('تعديل مادة غذائية', `
        <form id="edit-ingredient-form">
            <div class="mb-3">
                <label for="edit-ingredient-name" class="form-label">اسم المادة الغذائية</label>
                <input type="text" class="form-control" id="edit-ingredient-name" value="${ingredient.name}" required>
            </div>
            <div class="mb-3">
                <label for="edit-ingredient-unit" class="form-label">وحدة القياس</label>
                <select class="form-select" id="edit-ingredient-unit" required>
                    <option value="">اختر وحدة القياس</option>
                    <option value="كغ" ${ingredient.unit === 'كغ' ? 'selected' : ''}>كيلوغرام (كغ)</option>
                    <option value="غ" ${ingredient.unit === 'غ' ? 'selected' : ''}>غرام (غ)</option>
                    <option value="ل" ${ingredient.unit === 'ل' ? 'selected' : ''}>لتر (ل)</option>
                    <option value="مل" ${ingredient.unit === 'مل' ? 'selected' : ''}>ميليلتر (مل)</option>
                    <option value="قطعة" ${ingredient.unit === 'قطعة' ? 'selected' : ''}>قطعة</option>
                    <option value="علبة" ${ingredient.unit === 'علبة' ? 'selected' : ''}>علبة</option>
                    <option value="كيس" ${ingredient.unit === 'كيس' ? 'selected' : ''}>كيس</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="edit-ingredient-price" class="form-label">السعر (دج)</label>
                <input type="number" class="form-control" id="edit-ingredient-price" value="${ingredient.price}" min="0" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="edit-ingredient-quantity" class="form-label">الكمية المتوفرة</label>
                <input type="number" class="form-control" id="edit-ingredient-quantity" value="${ingredient.quantity}" min="0" step="0.01" required>
            </div>
            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
        </form>
    `);
    
    // معالجة إرسال النموذج
    document.getElementById('edit-ingredient-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // تحديث بيانات المادة الغذائية
        ingredient.name = document.getElementById('edit-ingredient-name').value;
        ingredient.unit = document.getElementById('edit-ingredient-unit').value;
        ingredient.price = parseFloat(document.getElementById('edit-ingredient-price').value);
        ingredient.quantity = parseFloat(document.getElementById('edit-ingredient-quantity').value);
        
        saveCafeteriaMealsData();
        renderFoodIngredients();
        
        // إضافة نشاط جديد
        addActivity('تعديل مادة غذائية', `تم تعديل مادة غذائية: ${ingredient.name}`);
        
        // إغلاق النافذة المنبثقة
        closeModal();
        
        // عرض رسالة نجاح
        showAlert('تم تعديل المادة الغذائية بنجاح', 'success');
    });
}

// حذف مادة غذائية
function deleteIngredient(ingredientId) {
    const ingredient = foodIngredients.find(i => i.id === ingredientId);
    if (!ingredient) {
        showAlert('لم يتم العثور على المادة الغذائية', 'danger');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف المادة الغذائية "${ingredient.name}"؟`)) {
        // التحقق من استخدام المادة الغذائية في وجبات
        const usedInMeals = dailyMeals.some(meal => 
            meal.ingredients.some(item => item.id === ingredientId)
        );
        
        if (usedInMeals) {
            showAlert('لا يمكن حذف هذه المادة الغذائية لأنها مستخدمة في وجبات مسجلة', 'warning');
            return;
        }
        
        // حذف المادة الغذائية
        foodIngredients = foodIngredients.filter(i => i.id !== ingredientId);
        
        saveCafeteriaMealsData();
        renderFoodIngredients();
        
        // إضافة نشاط جديد
        addActivity('حذف مادة غذائية', `تم حذف مادة غذائية: ${ingredient.name}`);
        
        // عرض رسالة نجاح
        showAlert('تم حذف المادة الغذائية بنجاح', 'success');
    }
}

// إضافة مخزون لمادة غذائية
function addIngredientStock(ingredientId) {
    const ingredient = foodIngredients.find(i => i.id === ingredientId);
    if (!ingredient) {
        showAlert('لم يتم العثور على المادة الغذائية', 'danger');
        return;
    }
    
    // إنشاء النافذة المنبثقة
    const modal = createModal('إضافة مخزون', `
        <form id="add-stock-form">
            <div class="mb-3">
                <label class="form-label">المادة الغذائية</label>
                <input type="text" class="form-control" value="${ingredient.name}" disabled>
            </div>
            <div class="mb-3">
                <label class="form-label">الكمية الحالية</label>
                <input type="text" class="form-control" value="${ingredient.quantity} ${ingredient.unit}" disabled>
            </div>
            <div class="mb-3">
                <label for="add-quantity" class="form-label">الكمية المضافة (${ingredient.unit})</label>
                <input type="number" class="form-control" id="add-quantity" min="0.01" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="stock-note" class="form-label">ملاحظات</label>
                <textarea class="form-control" id="stock-note" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">إضافة المخزون</button>
        </form>