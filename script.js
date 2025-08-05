document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones), workshop];

    let draggedItem = null;
    let unitCount = 0;

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

    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else {
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
    }

    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`;
        newUnit.draggable = true;

        // منطق السحب بالماوس (يعمل دائمًا)
        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', '');
            setTimeout(() => newUnit.classList.add('dragging'), 0);
        });
        newUnit.addEventListener('dragend', () => {
            newUnit.classList.remove('dragging');
            draggedItem = null;
        });

        // منطق النقر المزدوج (يعمل على جميع الأجهزة)
        newUnit.addEventListener('dblclick', () => {
            if (draggedItem) {
                // إذا كان هناك عنصر آخر "ممسوك" بالفعل، قم بإفلاته أولاً
                draggedItem.classList.remove('dragging');
            }
            // "التقاط" العنصر الجديد
            draggedItem = newUnit;
            newUnit.classList.add('dragging');
        });

        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', (e) => {
            // توقف عن معالجة حدث النقر المزدوج للسحب
            e.stopPropagation();

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
    
    // تهيئة مناطق الإسقاط
    allDropZones.forEach(element => {
        // منطق الماوس
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });
        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over');
        });
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            if (draggedItem && draggedItem.parentElement !== element) {
                element.appendChild(draggedItem);
                updateUnitColor(draggedItem, element);
                sortUnitsAlphabetically(element);
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });

        // منطق النقر (يعمل على جميع الأجهزة)
        element.addEventListener('click', () => {
            if (draggedItem && draggedItem.parentElement !== element) {
                element.appendChild(draggedItem);
                updateUnitColor(draggedItem, element);
                sortUnitsAlphabetically(element);
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });
    });

    addUnitButton.addEventListener('click', () => createDraggableUnit());

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
    
    sortUnitsAlphabetically(waitingWorkshop);
});
