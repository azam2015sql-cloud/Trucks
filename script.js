document.addEventListener('DOMContentLoaded', () => {
    const addUnitButton = document.getElementById('addUnitButton');
    const workshop = document.getElementById('workshop');
    const outWorkshop = document.getElementById('out-workshop');
    const waitingWorkshop = document.getElementById('waiting-workshop');
    const subsectionDropZones = document.querySelectorAll('.subsection-drop-zone');

    let draggedItem = null;
    let currentDropZone = null; // لتتبع منطقة الإسقاط الحالية أثناء اللمس
    let touchStartX, touchStartY; // لتخزين إحداثيات بداية اللمس على الشاشة
    let initialX, initialY; // لتخزين إحداثيات بداية العنصر (left, top) بالنسبة لـ viewport عندما يصبح fixed
    let isDraggingTouch = false; // علامة لتمييز السحب باللمس عن السحب بالماوس

    let unitCount = 0; // لترقيم الوحدات التي يضيفها المستخدم

    // دالة لفرز الوحدات أبجديًا
    function sortUnitsAlphabetically(container) {
        const units = Array.from(container.querySelectorAll('.draggable-unit'));
        units.sort((a, b) => {
            const textA = a.textContent.trim().toLowerCase();
            const textB = b.textContent.trim().toLowerCase();
            return textA.localeCompare(textB, 'ar', { sensitivity: 'base' });
        });
        // إعادة ترتيب العناصر في DOM
        units.forEach(unit => {
            container.appendChild(unit);
        });
    }

    // دالة لتحديد ما إذا كانت النقطة (x, y) داخل عنصر
    function isInside(x, y, element) {
        const rect = element.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
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

    // تهيئة مناطق الإسقاط (لأحداث الماوس)
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
            // تجاهل حدث الإفلات بالماوس إذا كان السحب باللمس نشطًا
            if (isDraggingTouch) return; 

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

    // قائمة بجميع مناطق الإسقاط الصالحة، بما في ذلك الورشة الرئيسية وأقسامها الفرعية
    const allDropZones = [waitingWorkshop, outWorkshop, ...Array.from(subsectionDropZones)];
    // إضافة الورشة الرئيسية بشكل منفصل إلى قائمة الـ drop zones لتبسيط التحقق في touchmove
    allDropZones.push(workshop);

    // تطبيق تهيئة مناطق الإسقاط على جميع المناطق
    allDropZones.forEach(zone => {
        setupDropZone(zone);
    });

    // دالة إنشاء وحدة جديدة
    function createDraggableUnit(initialText = null) {
        const newUnit = document.createElement('div');
        newUnit.className = 'draggable-unit';
        
        newUnit.textContent = initialText || `وحدة رقم ${++unitCount}`; 
        newUnit.draggable = true; // خاص بأحداث الماوس

        // أحداث الماوس (تبقى كما هي لدعم الكمبيوتر)
        newUnit.addEventListener('dragstart', (e) => {
            isDraggingTouch = false; // تأكيد أن هذا سحب بالماوس
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

        // أحداث اللمس (Touch Events)
        newUnit.addEventListener('touchstart', (e) => {
            // التأكد من لمسة واحدة فقط للسحب وعدم وجود سحب آخر نشط
            if (e.touches.length === 1 && !draggedItem) { 
                e.preventDefault(); // منع السلوك الافتراضي (مثل التمرير)
                isDraggingTouch = true; // تعيين علامة السحب باللمس
                draggedItem = newUnit;
                
                // حفظ الموضع الحالي للعنصر بالنسبة لـ viewport قبل تغيير موقعه إلى fixed
                const rect = draggedItem.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;

                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;

                // تطبيق أنماط السحب لجعل العنصر "عائمًا"
                draggedItem.style.position = 'fixed'; // استخدم fixed لتتبع اللمس على الشاشة بأكملها
                draggedItem.style.zIndex = '1000';
                draggedItem.style.pointerEvents = 'none'; // منع تلقي أحداث الماوس أثناء السحب باللمس
                draggedItem.classList.add('dragging');

                // تحديث موقعه فورًا ليكون مركز المربع تحت الإصبع
                draggedItem.style.left = (touchStartX - draggedItem.offsetWidth / 2) + 'px';
                draggedItem.style.top = (touchStartY - draggedItem.offsetHeight / 2) + 'px';
            }
        });

        newUnit.addEventListener('touchmove', (e) => {
            if (draggedItem && isDraggingTouch) {
                e.preventDefault(); // منع التمرير أثناء السحب

                const currentTouchX = e.touches[0].clientX;
                const currentTouchY = e.touches[0].clientY;

                // تحديث موقع العنصر المسحوب ليكون مركز المربع تحت الإصبع
                draggedItem.style.left = (currentTouchX - draggedItem.offsetWidth / 2) + 'px';
                draggedItem.style.top = (currentTouchY - draggedItem.offsetHeight / 2) + 'px';

                // تحديد منطقة الإسقاط الحالية (لإضافة تأثير drag-over)
                let foundDropZone = null;
                // إزالة التأثير من جميع المناطق أولاً قبل التحقق
                allDropZones.forEach(zone => zone.classList.remove('drag-over'));
                
                // البحث عن منطقة الإسقاط الصحيحة
                for (let i = 0; i < allDropZones.length; i++) {
                    const zone = allDropZones[i];
                    if (isInside(currentTouchX, currentTouchY, zone)) {
                        foundDropZone = zone;
                        zone.classList.add('drag-over');
                        break; // بمجرد العثور على منطقة، توقف
                    }
                }
                currentDropZone = foundDropZone;
            }
        });

        newUnit.addEventListener('touchend', () => {
            if (draggedItem && isDraggingTouch) {
                // إزالة أنماط السحب
                draggedItem.style.position = ''; // إزالة fixed أو absolute
                draggedItem.style.zIndex = '';
                draggedItem.style.left = ''; // إزالة الموقع المخصص
                draggedItem.style.top = '';  // إزالة الموقع المخصص
                draggedItem.style.pointerEvents = ''; // إعادة تفعيل الأحداث
                draggedItem.classList.remove('dragging');

                // إذا كانت هناك منطقة إسقاط صالحة ومختلفة عن الحالية
                if (currentDropZone && draggedItem.parentElement !== currentDropZone) {
                    if (draggedItem.parentElement) {
                        draggedItem.parentElement.removeChild(draggedItem);
                    }
                    currentDropZone.appendChild(draggedItem);
                    updateUnitColor(draggedItem, currentDropZone);
                    sortUnitsAlphabetically(currentDropZone);
                } else {
                    // إذا لم يكن هناك إسقاط صالح، أو كان في نفس المنطقة، سيبقى في مكانه الحالي.
                    // لا نحتاج لإعادته يدويًا لأنه بمجرد إزالة position:fixed/absolute
                    // سيعود إلى ترتيبه الطبيعي ضمن سياق Flexbox/Grid.
                }

                // تنظيف تأثير drag-over من جميع المناطق
                allDropZones.forEach(zone => {
                    zone.classList.remove('drag-over');
                });

                draggedItem = null;
                currentDropZone = null;
                isDraggingTouch = false; // إعادة تعيين علامة السحب باللمس
            }
        });

        // دبل كليك لتعديل النص
        newUnit.addEventListener('dblclick', () => {
            // منع تفعيل التعديل بالنقر المزدوج إذا كان المربع في وضع السحب
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

        // إضافة الوحدة إلى منطقة الانتظار افتراضيًا
        waitingWorkshop.appendChild(newUnit); 
        newUnit.style.backgroundColor = 'var(--accent-orange)';
    }

    // زر إضافة وحدة جديدة
    addUnitButton.addEventListener('click', () => createDraggableUnit()); 

    // **إضافة المربعات الابتدائية عند تحميل الصفحة**
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
