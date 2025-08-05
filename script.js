document.addEventListener('DOMContentLoaded', () => {
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');

    let selectedUnit = null;
    
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
        if (selectedUnit) {
            selectedUnit.classList.remove('selected');
        }
        selectedUnit = unit;
        selectedUnit.classList.add('selected');
    }

    // دالة لنقل الوحدة المحددة إلى منطقة جديدة
    function moveSelectedUnitTo(targetDropZone) {
        if (selectedUnit) {
            if (selectedUnit.parentElement !== targetDropZone) {
                targetDropZone.appendChild(selectedUnit);
                updateUnitColor(selectedUnit, targetDropZone);
                sortUnitsAlphabetically(targetDropZone);
            }
            selectedUnit.classList.remove('selected');
            selectedUnit = null;
        }
    }
    
    // تهيئة مناطق الإسقاط
    const allDropZones = [workshop, outWorkshop, waitingWorkshop, ...Array.from(subsectionDropZones)];
    allDropZones.forEach(zone => {
        zone.addEventListener('click', (e) => {
            e.preventDefault();
            if (selectedUnit) {
                moveSelectedUnitTo(zone);
            }
        });
    });

    // تفويض الأحداث للتعامل مع النقر على زر الحذف
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.stopPropagation();
            const unitToDelete = e.target.closest('.draggable-unit');
            if (confirm('هل أنت متأكد أنك تريد حذف هذه الوحدة؟')) {
                unitToDelete.parentElement.removeChild(unitToDelete);
                if (selectedUnit === unitToDelete) {
                    selectedUnit = null;
                }
            }
        }
    });

    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        
        const unitTextSpan = document.createElement('span');
        unitTextSpan.className = 'unit-text-content';
        unitTextSpan.textContent = initialText;
        
        // إنشاء زر الحذف
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        
        // إضافة المحتوى وزر الحذف إلى الوحدة
        newUnit.appendChild(unitTextSpan);
        newUnit.appendChild(deleteBtn);
        
        // حدث النقر على الوحدة لتحديدها
        newUnit.addEventListener('click', (e) => {
            e.stopPropagation();
            selectUnit(newUnit);
        });

        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            
            const currentText = unitTextSpan.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';

            newUnit.innerHTML = '';
            newUnit.appendChild(inputField);
            inputField.focus();

            const saveChanges = () => {
                const newText = inputField.value.trim() || currentText;
                
                newUnit.innerHTML = '';
                unitTextSpan.textContent = newText;
                newUnit.appendChild(unitTextSpan);
                newUnit.appendChild(deleteBtn);

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
    
    // إضافة المربعات الأولية
    const totalInitialUnits = 235;
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
            unitText = `${specialNumbersForLastBlock[lastNumIndex]}`;
        }
        createDraggableUnit(unitText);
    }
    
    // الفرز النهائي بعد إضافة جميع المربعات
    sortUnitsAlphabetically(waitingWorkshop);
});
