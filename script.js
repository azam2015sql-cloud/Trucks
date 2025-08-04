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

    // دالة مساعدة لتحديث لون الوحدة بناءً على منطقة الإسقاط
    function updateUnitColor(unit, dropZoneElement) {
        if (dropZoneElement.id === 'out-workshop') {
            unit.style.backgroundColor = 'var(--danger-red)';
        } else if (dropZoneElement.id === 'waiting-workshop') {
            unit.style.backgroundColor = 'var(--accent-orange)';
        } else { // أي منطقة ورشة عمل فرعية أو الورشة الرئيسية نفسها
            unit.style.backgroundColor = 'var(--primary-blue)';
        }
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
                updateUnitColor(draggedItem, element);
                sortUnitsAlphabetically(element);
            }
        });
    }

    // تطبيق تهيئة مناطق الإسقاط على جميع المناطق
    setupDropZone(waitingWorkshop);
    setupDropZone(outWorkshop);
    
    subsectionDropZones.forEach(zone => {
        setupDropZone(zone);
    });

    // أحداث السحب والإفلات الخاصة بالورشة الرئيسية (Workshop)
    workshop.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetIsSubsection = e.target.closest('.subsection-drop-zone');
        // إذا كان draggedItem موجودًا وليس حاليًا في الورشة الرئيسية أو إحدى أقسامها الفرعية
        if (draggedItem && !targetIsSubsection && !workshop.contains(draggedItem)) {
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
        // إذا لم يكن الهدف قسماً فرعياً و draggedItem ليس بالفعل في الورشة الرئيسية أو إحدى أقسامها
        if (!targetIsSubsection && draggedItem && !workshop.contains(draggedItem)) {
            workshop.appendChild(draggedItem);
            updateUnitColor(draggedItem, workshop);
            // لا نفرز الورشة الرئيسية إلا إذا أردت ترتيب الوحدات فيها مباشرة
            // sortUnitsAlphabetically(workshop); 
        }
    });


    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`; 
        newUnit.draggable = true;

        newUnit.addEventListener('dragstart', (e) => {
            draggedItem = newUnit;
            e.dataTransfer.setData('text/plain', ''); // ضروري لفايرفوكس
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
                if (newUnit.contains(inputField)) { // التحقق قبل الإزالة
                    newUnit.removeChild(inputField);
                }
                sortUnitsAlphabetically(newUnit.parentElement);
            };

            inputField.addEventListener('blur', saveChanges);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveChanges();
                    inputField.blur(); // لإزالة التركيز وتشغيل blur event
                }
            });
        });

        waitingWorkshop.appendChild(newUnit); 
        newUnit.style.backgroundColor = 'var(--accent-orange)';
        // لا نفرز هنا مباشرة بعد كل إضافة فردية في الحلقة
        // سنقوم بالفرز مرة واحدة بعد إضافة كل المربعات الأولية.
    }

    addUnitButton.addEventListener('click', () => createDraggableUnit()); 

    // **إضافة المربعات الابتدائية هنا**
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
    
    // بعد إضافة جميع المربعات الأولية، قم بفرزها مرة واحدة
    sortUnitsAlphabetically(waitingWorkshop);
});
