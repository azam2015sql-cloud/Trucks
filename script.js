document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');

    let selectedUnit = null; // الوحدة المحددة حاليًا للنقل
    let unitCount = 0;
    
    // دالة لفرز الوحدات أبجديًا
    function sortUnitsAlphabetically(container) {
        const units = Array.from(container.querySelectorAll('.draggable-unit'));
        units.sort((a, b) => {
            const textA = a.textContent.trim().toLowerCase();
            const textB = b.textContent.trim().toLowerCase();
            return textA.localeCompare(textB, 'ar', { sensitivity: 'base' });
        });
        units.forEach(unit => {
            container.appendChild(unit);
        });
    }

    // دالة مساعدة لتحديث لون الوحدة بناءً على منطقة الإسقاط
    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }

    // دالة لتحديد وحدة
    function selectUnit(unit) {
        // إزالة التحديد من أي وحدة سابقة
        if (selectedUnit) {
            selectedUnit.classList.remove('selected');
        }
        // تحديد الوحدة الجديدة
        selectedUnit = unit;
        selectedUnit.classList.add('selected');
    }

    // دالة لنقل الوحدة المحددة إلى منطقة جديدة
    function moveSelectedUnitTo(targetDropZone) {
        if (selectedUnit) {
            // التحقق من أن الوحدة المحددة ليست في نفس المنطقة بالفعل
            if (selectedUnit.parentElement !== targetDropZone) {
                targetDropZone.appendChild(selectedUnit);
                updateUnitColor(selectedUnit, targetDropZone);
                sortUnitsAlphabetically(targetDropZone);
            }
            // إزالة التحديد بعد النقل
            selectedUnit.classList.remove('selected');
            selectedUnit = null;
        }
    }
    
    // تهيئة مناطق الإسقاط
    const allDropZones = [workshop, outWorkshop, waitingWorkshop, ...Array.from(subsectionDropZones)];
    allDropZones.forEach(zone => {
        zone.addEventListener('click', (e) => {
            e.preventDefault();
            // إذا كان هناك وحدة محددة، قم بنقلها إلى هذه المنطقة
            if (selectedUnit) {
                moveSelectedUnitTo(zone);
            }
        });
    });

    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`;
        
        // إنشاء زر الحذف
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        
        // حدث النقر على زر الحذف
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // منع النقر من تحديد الوحدة
            if (confirm('هل أنت متأكد أنك تريد حذف هذه الوحدة؟')) {
                newUnit.parentElement.removeChild(newUnit);
                // إذا كانت الوحدة المحذوفة هي المحددة حاليًا، أزل التحديد
                if (selectedUnit === newUnit) {
                    selectedUnit = null;
                }
            }
        });

        // إضافة زر الحذف إلى الوحدة
        newUnit.appendChild(deleteBtn);
        
        // حدث النقر على الوحدة لتحديدها
        newUnit.addEventListener('click', (e) => {
            e.stopPropagation(); // منع النقر من الوصول إلى المنطقة الخلفية
            selectUnit(newUnit);
        });

        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', (e) => {
            e.stopPropagation(); // منع النقر المزدوج من تحديد الوحدة
            
            // إزالة زر الحذف مؤقتًا أثناء التعديل
            deleteBtn.style.display = 'none';

            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText.replace('×', '').trim(); // إزالة زر الحذف من النص
            inputField.className = 'edit-unit-input';

            newUnit.textContent = '';
            newUnit.appendChild(inputField);
            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText;
                // إعادة إضافة زر الحذف
                newUnit.appendChild(deleteBtn);
                deleteBtn.style.display = 'block';

                if (newUnit.contains(inputField)) {
                    newUnit.removeChild(inputField);
                }
                sortUnitsAlphabetically(newUnit.parentElement);
            };

            inputField.addEventListener('blur', saveChanges);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                    inputField.blur();
                }
            });
        });

        waitingWorkshop.appendChild(newUnit); 
        updateUnitColor(newUnit, waitingWorkshop);
    }
    
    // زر الإضافة
    addUnitButton.addEventListener('click', () => createDraggableUnit());

    // إضافة المربعات الأولية
    const totalInitialUnits = 236;
    let specialNumbersForLastBlock = [1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558, 1560];

    for (let i = 0; i < totalInitialUnits; i++) {
        let unitText;

        if (i < 221) {
            unitText = `${3001 + i}`;
        } else if (i === 221) {
            unitText = '3234';
        } else if (i > 221 && i < 226) {
            unitText = `${3562 + (i - 222)}`;
        } else {
            const lastNumIndex = i - 226;
            if (lastNumIndex < specialNumbersForLastBlock.length) {
                unitText = `${specialNumbersForLastBlock[lastNumIndex]}`;
            } else {
                unitText = `وحدة إضافية ${++unitCount}`;
            }
        }
        createDraggableUnit(unitText);
    }
    
    // الفرز النهائي بعد إضافة جميع المربعات
    sortUnitsAlphabetically(waitingWorkshop);
});
