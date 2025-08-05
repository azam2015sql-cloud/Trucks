document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');

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
    
    // إعداد مكتبة SortableJS لجميع مناطق الإسقاط
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones), workshop];

    allDropZones.forEach(zone => {
        Sortable.create(zone, {
            group: 'shared', // يسمح بسحب العناصر بين جميع المجموعات
            animation: 150,
            ghostClass: 'dragging', // هذا الكلاس سيُضاف عند السحب لتعديل مظهره
            onEnd: function(evt) {
                // عند انتهاء السحب
                const unit = evt.item;
                const newParent = evt.to;
                updateUnitColor(unit, newParent);
                sortUnitsAlphabetically(newParent);
            }
        });
    });

    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`;
        
        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', (e) => {
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
