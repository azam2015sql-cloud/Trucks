document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');

    let draggedItem = null;
    let unitCount = 0; // سيتم استخدام هذا الآن لترقيم الوحدات التي يضيفها المستخدم

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

    // تهيئة مناطق الإسقاط
    function setupDropZone(element) {
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

            if (draggedItem && draggedItem.parentElement !== element) {
                if (draggedItem.parentElement) {
                    draggedItem.parentElement.removeChild(draggedItem);
                }
                
                element.appendChild(draggedItem);
                
                if (element.id === 'out-workshop') {
                    draggedItem.style.backgroundColor = 'var(--danger-red)';
                } else if (element.id === 'waiting-workshop') {
                    draggedItem.style.backgroundColor = 'var(--accent-orange)';
                }
                else { 
                    draggedItem.style.backgroundColor = 'var(--primary-blue)';
                }

                sortUnitsAlphabetically(element);
            }
        });
    }

    setupDropZone(waitingWorkshop);
    setupDropZone(outWorkshop);    
    
    subsectionDropZones.forEach(zone => {
        setupDropZone(zone);
    });

    workshop.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetIsSubsection = e.target.closest('.subsection-drop-zone');
        if (!targetIsSubsection && draggedItem && draggedItem.parentElement !== workshop) {
            workshop.classList.add('drag-over');
        } else {
            workshop.classList.remove('drag-over');
        }
    });

    workshop.addEventListener('dragleave', () => {
        workshop.classList.remove('drag-over');
    });

    workshop.addEventListener('drop', (e) => {
        e.preventDefault();
        workshop.classList.remove('drag-over');

        const targetIsSubsection = e.target.closest('.subsection-drop-zone');
        if (!targetIsSubsection && draggedItem && draggedItem.parentElement !== workshop) {
            workshop.appendChild(draggedItem);
            draggedItem.style.backgroundColor = 'var(--primary-blue)';
        }
    });

    // تم تعديل الدالة لقبول نص مبدئي لإنشاء المربعات الأولية
    // إذا كان `initialText` فارغاً، فسيتم استخدام الترقيم التلقائي.
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        
        // إذا كان هناك نص مبدئي محدد، استخدمه. وإلا، استخدم ترقيم 'وحدة رقم'.
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`; 
        newUnit.draggable = true;

        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => {
                newUnit.classList.add('dragging');
            }, 0);
        });

        newUnit.addEventListener('dragend', () => {
            newUnit.classList.remove('dragging');
            draggedItem = null;
        });

        newUnit.addEventListener('dblclick', () => {
            if (newUnit.classList.contains('dragging')) {
                return;
            }

            const currentText = newUnit.textContent;
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-unit-input';

            newUnit.textContent = '';
            newUnit.appendChild(inputField);

            inputField.focus();

            const saveChanges = () => {
                newUnit.textContent = inputField.value.trim() || currentText; // إذا تركه فارغاً، يعود للنص الأصلي
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
        newUnit.style.backgroundColor = 'var(--accent-orange)';
        // لا نفرز هنا مباشرة بعد كل إضافة فردية في الحلقة
        // سنقوم بالفرز مرة واحدة بعد إضافة كل المربعات الأولية.
    }

    addUnitButton.addEventListener('click', () => createDraggableUnit()); // زر الإضافة يستدعي الدالة بدون نص مبدئي

    // **إضافة المربعات الابتدائية هنا**
    const totalInitialUnits = 236;
    const numberedUnitsStart = 3001;
    const numberedUnitsEnd = 3221; // (3221 - 3001) + 1 = 221 مربع

    for (let i = 0; i < totalInitialUnits; i++) {
        let unitText;
        if (i < (numberedUnitsEnd - numberedUnitsStart + 1)) {
            // قم بترقيم 221 مربعًا من 3001 إلى 3221
            unitText = `${numberedUnitsStart + i}`;
        } else {
            // لبقية المربعات (236 - 221 = 15 مربعًا)، استخدم الترقيم الافتراضي
            unitText = `وحدة رقم ${unitCount + 1}`; // +1 لأن createDraggableUnit ستزيد unitCount
            unitCount++; // زد العداد للمربعات غير المرقمة
        }
        createDraggableUnit(unitText);
    }
    
    // بعد إضافة جميع المربعات الأولية، قم بفرزها مرة واحدة
    sortUnitsAlphabetically(waitingWorkshop);
});