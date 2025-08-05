document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const allDropZones = document.querySelectorAll('.drop-zone, .subsection-drop-zone');

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

    function handleDrop(targetDropZone) {
        if (draggedItem && targetDropZone && draggedItem.parentElement !== targetDropZone) {
            targetDropZone.appendChild(draggedItem);
            updateUnitColor(draggedItem, targetDropZone);
            sortUnitsAlphabetically(targetDropZone);
        }
        
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem.style.removeProperty('position');
            draggedItem.style.removeProperty('top');
            draggedItem.style.removeProperty('left');
            draggedItem.style.removeProperty('z-index');
            draggedItem.style.removeProperty('opacity');
            draggedItem.style.removeProperty('transform');
            draggedItem = null;
        }
        document.querySelectorAll('.drag-over').forEach(zone => zone.classList.remove('drag-over'));
    }

    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`;
        newUnit.draggable = true;

        // منطق السحب بالماوس
        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => newUnit.classList.add('dragging'), 0);
        });
        newUnit.addEventListener('dragend', () => {
            newUnit.classList.remove('dragging');
            draggedItem = null;
        });

        // منطق النقر المزدوج (للكمبيوتر واللمس)
        newUnit.addEventListener('dblclick', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
            }
            draggedItem = newUnit;
            newUnit.classList.add('dragging');
        });

        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', (e) => {
            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';
            e.stopPropagation(); // منع انتقال السحب والإفلات

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
            e.dataTransfer.dropEffect = 'move';
            element.classList.add('drag-over');
        });
        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over');
        });
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            handleDrop(element);
        });

        // منطق النقر للإلقاء (للكمبيوتر واللمس)
        element.addEventListener('click', () => {
            handleDrop(element);
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
