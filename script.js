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
        
        // حدث النقر على الوحدة لتحديدها
        newUnit.addEventListener('click', (e) => {
            e.stopPropagation(); // منع النقر من الوصول إلى المنطقة الخلفية
            selectUnit(newUnit);
        });

        // دبل كليك لتعديل النص (سواء بالماوس أو باللمس)
        newUnit.addEventListener('dblclick', (e) => {
            e.stopPropagation(); // منع النقر المزدوج من تحديد الوحدة
            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';

            newUnit.textContent = '';
            newUnit.appendChild(inputField);
            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText;
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
    const numberedUnitsStart = 3001;
    const numberedUnitsEnd = 3221;

    for (let i = 0; i < totalInitialUnits; i++) {
        let unitText;
        if (i < (numberedUnitsEnd - numberedUnitsStart + 1)) {
            unitText = `${numberedUnitsStart + i}`;
        } else {
            unitText = `وحدة رقم ${unitCount + 1}`;
            unitCount++;
        }
        createDraggableUnit(unitText);
    }
    
    // الفرز النهائي بعد إضافة جميع المربعات
    sortUnitsAlphabetically(waitingWorkshop);
});
