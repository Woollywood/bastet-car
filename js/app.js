'use strict';

// Включить/выключить FLS (Full Logging System) (в работе)
window['FLS'] = true;

const flsModules = {};

/* Проверка поддержки webp, добавление класса webp или no-webp для HTML*/
function isWebp() {
	// Проверка поддержки webp
	function testWebP(callback) {
		let webP = new Image();
		webP.onload = webP.onerror = function () {
			callback(webP.height == 2);
		};
		webP.src =
			'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
	}
	// Добавление класса _webp или _no-webp для HTML
	testWebP(function (support) {
		let className = support === true ? 'webp' : 'no-webp';
		document.documentElement.classList.add(className);
	});
}
// Вспомогательные модули плавного раскрытия и закрытия объекта
let _slideUp = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = `${target.offsetHeight}px`;
		target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		window.setTimeout(() => {
			target.hidden = !showmore ? true : false;
			!showmore ? target.style.removeProperty('height') : null;
			target.style.removeProperty('padding-top');
			target.style.removeProperty('padding-bottom');
			target.style.removeProperty('margin-top');
			target.style.removeProperty('margin-bottom');
			!showmore ? target.style.removeProperty('overflow') : null;
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
			// Создаем событие
			document.dispatchEvent(
				new CustomEvent('slideUpDone', {
					detail: {
						target: target,
					},
				})
			);
		}, duration);
	}
};
let _slideDown = (target, duration = 500, showmore = 0) => {
	if (!target.classList.contains('_slide')) {
		target.classList.add('_slide');
		target.hidden = target.hidden ? false : null;
		showmore ? target.style.removeProperty('height') : null;
		let height = target.offsetHeight;
		target.style.overflow = 'hidden';
		target.style.height = showmore ? `${showmore}px` : `0px`;
		target.style.paddingTop = 0;
		target.style.paddingBottom = 0;
		target.style.marginTop = 0;
		target.style.marginBottom = 0;
		target.offsetHeight;
		target.style.transitionProperty = 'height, margin, padding';
		target.style.transitionDuration = duration + 'ms';
		target.style.height = height + 'px';
		target.style.removeProperty('padding-top');
		target.style.removeProperty('padding-bottom');
		target.style.removeProperty('margin-top');
		target.style.removeProperty('margin-bottom');
		window.setTimeout(() => {
			target.style.removeProperty('height');
			target.style.removeProperty('overflow');
			target.style.removeProperty('transition-duration');
			target.style.removeProperty('transition-property');
			target.classList.remove('_slide');
			// Создаем событие
			document.dispatchEvent(
				new CustomEvent('slideDownDone', {
					detail: {
						target: target,
					},
				})
			);
		}, duration);
	}
};
let _slideToggle = (target, duration = 500) => {
	if (target.hidden) {
		return _slideDown(target, duration);
	} else {
		return _slideUp(target, duration);
	}
};

// FLS (Full Logging System)
function FLSLog(message) {
	setTimeout(() => {
		if (window.FLS) {
			console.log(message);
		}
	}, 0);
}

// Функция получения индекса внутри родительского элемента
function indexInParent(parent, element) {
	const array = Array.prototype.slice.call(parent.children);
	return Array.prototype.indexOf.call(array, element);
}

function spollers() {
	const spollersArray = document.querySelectorAll("[data-spollers]");
	if (spollersArray.length > 0) {
		// Событие клика
		document.addEventListener("click", setSpollerAction);
		// Получение обычных слойлеров
		const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
			return !item.dataset.spollers.split(",")[0];
		});
		// Инициализация обычных слойлеров
		if (spollersRegular.length) {
			initSpollers(spollersRegular);
		}
		// Получение слойлеров с медиа-запросами
		let mdQueriesArray = dataMediaQueries(spollersArray, "spollers");
		if (mdQueriesArray && mdQueriesArray.length) {
			mdQueriesArray.forEach((mdQueriesItem) => {
				// Событие
				mdQueriesItem.matchMedia.addEventListener("change", function () {
					initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
				initSpollers(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
			});
		}
		// Инициализация
		function initSpollers(spollersArray, matchMedia = false) {
			spollersArray.forEach((spollersBlock) => {
				spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
				if (matchMedia.matches || !matchMedia) {
					spollersBlock.classList.add("_spoller-init");
					initSpollerBody(spollersBlock);
				} else {
					spollersBlock.classList.remove("_spoller-init");
					initSpollerBody(spollersBlock, false);
				}
			});
		}
		// Работа с контентом
		function initSpollerBody(spollersBlock, hideSpollerBody = true) {
			let spollerItems = spollersBlock.querySelectorAll("details");
			if (spollerItems.length) {
				spollerItems = Array.from(spollerItems).filter(
					(item) => item.closest("[data-spollers]") === spollersBlock
				);
				spollerItems.forEach((spollerItem) => {
					let spollerTitle = spollerItem.querySelector("summary");
					if (hideSpollerBody) {
						spollerTitle.removeAttribute("tabindex");
						if (!spollerItem.hasAttribute("data-open")) {
							spollerItem.open = false;
							spollerTitle.nextElementSibling.hidden = true;
						} else {
							spollerTitle.classList.add("_spoller-active");
							spollerItem.open = true;
						}
					} else {
						spollerTitle.setAttribute("tabindex", "-1");
						spollerTitle.classList.remove("_spoller-active");
						spollerItem.open = true;
						spollerTitle.nextElementSibling.hidden = false;
					}
				});
			}
		}
		function setSpollerAction(e) {
			const el = e.target;
			if (el.closest("summary") && el.closest("[data-spollers]")) {
				if (el.closest("[data-spollers]").classList.contains("_spoller-init")) {
					const spollerTitle = el.closest("summary");
					const spollerBlock = spollerTitle.closest("details");
					const spollersBlock = spollerTitle.closest("[data-spollers]");
					const oneSpoller = spollersBlock.hasAttribute("data-one-spoller");
					const spollerSpeed = spollersBlock.dataset.spollersSpeed
						? parseInt(spollersBlock.dataset.spollersSpeed)
						: 500;
					if (!spollersBlock.querySelectorAll("._slide").length) {
						if (oneSpoller && !spollerBlock.open) {
							hideSpollersBody(spollersBlock);
						}
						spollerTitle.classList.toggle("_spoller-active");
						_slideToggle(spollerTitle.nextElementSibling, spollerSpeed);

						!spollerBlock.open
							? (spollerBlock.open = true)
							: setTimeout(() => {
									spollerBlock.open = false;
							  }, spollerSpeed);
					}
				}
				e.preventDefault();
			}
			// Закрытие при клике вне спойлера
			if (!el.closest("[data-spollers]")) {
				const spollersClose = document.querySelectorAll("[data-spoller-close]");
				if (spollersClose.length) {
					spollersClose.forEach((spollerClose) => {
						const spollersBlock = spollerClose.closest("[data-spollers]");
						const spollerCloseBlock = spollerClose.parentNode;
						if (spollersBlock.classList.contains("_spoller-init")) {
							const spollerSpeed = spollersBlock.dataset.spollersSpeed
								? parseInt(spollersBlock.dataset.spollersSpeed)
								: 500;
							spollerClose.classList.remove("_spoller-active");
							_slideUp(spollerClose.nextElementSibling, spollerSpeed);
							setTimeout(() => {
								spollerCloseBlock.open = false;
							}, spollerSpeed);
						}
					});
				}
			}
		}
		function hideSpollersBody(spollersBlock) {
			const spollerActiveBlock = spollersBlock.querySelector("details[open]");
			if (spollerActiveBlock && !spollersBlock.querySelectorAll("._slide").length) {
				const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
				const spollerSpeed = spollersBlock.dataset.spollersSpeed
					? parseInt(spollersBlock.dataset.spollersSpeed)
					: 500;
				spollerActiveTitle.classList.remove("_spoller-active");
				_slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
				setTimeout(() => {
					spollerActiveBlock.open = false;
				}, spollerSpeed);
			}
		}
	}
}

function dataMediaQueries(array, dataSetValue) {
	// Получение объектов с медиа-запросами
	const media = Array.from(array).filter(function (item, index, self) {
		if (item.dataset[dataSetValue]) {
			return item.dataset[dataSetValue].split(",")[0];
		}
	});
	// Инициализация объектов с медиа-запросами
	if (media.length) {
		const breakpointsArray = [];
		media.forEach((item) => {
			const params = item.dataset[dataSetValue];
			const breakpoint = {};
			const paramsArray = params.split(",");
			breakpoint.value = paramsArray[0];
			breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
			breakpoint.item = item;
			breakpointsArray.push(breakpoint);
		});
		// Получаем уникальные брейкпоинты
		let mdQueries = breakpointsArray.map(function (item) {
			return "(" + item.type + "-width: " + item.value + "px)," + item.value + "," + item.type;
		});
		mdQueries = uniqArray(mdQueries);
		const mdQueriesArray = [];

		if (mdQueries.length) {
			// Работаем с каждым брейкпоинтом
			mdQueries.forEach((breakpoint) => {
				const paramsArray = breakpoint.split(",");
				const mediaBreakpoint = paramsArray[1];
				const mediaType = paramsArray[2];
				const matchMedia = window.matchMedia(paramsArray[0]);
				// Объекты с необходимыми условиями
				const itemsArray = breakpointsArray.filter(function (item) {
					if (item.value === mediaBreakpoint && item.type === mediaType) {
						return true;
					}
				});
				mdQueriesArray.push({
					itemsArray,
					matchMedia,
				});
			});
			return mdQueriesArray;
		}
	}
}

//================================================================================================================================================================================================================================================================================================================

// Работа с полями формы.
function formFieldsInit(options = { viewPass: false, autoHeight: false }) {
	document.body.addEventListener('focusin', function (e) {
		const targetElement = e.target;
		if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.add('_form-focus');
				targetElement.parentElement.classList.add('_form-focus');
			}
			formValidate.removeError(targetElement);
			targetElement.hasAttribute('data-validate') ? formValidate.removeError(targetElement) : null;
		}
	});
	document.body.addEventListener('focusout', function (e) {
		const targetElement = e.target;
		if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.remove('_form-focus');
				targetElement.parentElement.classList.remove('_form-focus');
			}
			// Мгновенная валидация
			targetElement.hasAttribute('data-validate') ? formValidate.validateInput(targetElement) : null;
		}
	});
	// Если включено, добавляем функционал "Показать пароль"
	if (options.viewPass) {
		document.addEventListener('click', function (e) {
			let targetElement = e.target;
			if (targetElement.closest('[class*="__viewpass"]')) {
				let inputType = targetElement.classList.contains('_viewpass-active') ? 'password' : 'text';
				targetElement.parentElement.querySelector('input').setAttribute('type', inputType);
				targetElement.classList.toggle('_viewpass-active');
			}
		});
	}
	// Если включено, добавляем функционал "Автовысота"
	if (options.autoHeight) {
		const textareas = document.querySelectorAll('textarea[data-autoheight]');
		if (textareas.length) {
			textareas.forEach((textarea) => {
				const startHeight = textarea.hasAttribute('data-autoheight-min')
					? Number(textarea.dataset.autoheightMin)
					: Number(textarea.offsetHeight);
				const maxHeight = textarea.hasAttribute('data-autoheight-max')
					? Number(textarea.dataset.autoheightMax)
					: Infinity;
				setHeight(textarea, Math.min(startHeight, maxHeight));
				textarea.addEventListener('input', () => {
					if (textarea.scrollHeight > startHeight) {
						textarea.style.height = `auto`;
						setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
					}
				});
			});
			function setHeight(textarea, height) {
				textarea.style.height = `${height}px`;
			}
		}
	}
}
// Валидация форм
let formValidate = {
	getErrors(form) {
		let error = 0;
		let formRequiredItems = form.querySelectorAll('*[data-required]');
		if (formRequiredItems.length) {
			formRequiredItems.forEach((formRequiredItem) => {
				if (
					(formRequiredItem.offsetParent !== null || formRequiredItem.tagName === 'SELECT') &&
					!formRequiredItem.disabled
				) {
					error += this.validateInput(formRequiredItem);
				}
			});
		}
		return error;
	},
	validateInput(formRequiredItem) {
		let error = 0;
		if (formRequiredItem.dataset.required === 'email') {
			formRequiredItem.value = formRequiredItem.value.replace(' ', '');
			if (this.emailTest(formRequiredItem)) {
				this.addError(formRequiredItem);
				error++;
			} else {
				this.removeError(formRequiredItem);
			}
		} else if (formRequiredItem.type === 'checkbox' && !formRequiredItem.checked) {
			this.addError(formRequiredItem);
			error++;
		} else {
			if (formRequiredItem.tagName === 'SELECT' && !formRequiredItem.value) {
				this.addError(formRequiredItem);
				error++;
			} else if (!formRequiredItem.value.trim()) {
				this.addError(formRequiredItem);
				error++;
			} else if (formRequiredItem.classList.contains('tel') && formRequiredItem.value.includes('_')) {
				this.addError(formRequiredItem);
				error++;
			} else {
				this.removeError(formRequiredItem);
			}
		}
		return error;
	},
	addError(formRequiredItem) {
		formRequiredItem.classList.add('_form-error');
		if (formRequiredItem.tagName === 'SELECT') {
			formRequiredItem.closest('.input-wrapper').classList.add('_form-error');
		} else {
			formRequiredItem.parentElement.classList.add('_form-error');
			let inputError = formRequiredItem.parentElement.querySelector('.form__error');
			if (inputError) formRequiredItem.parentElement.removeChild(inputError);
			if (formRequiredItem.dataset.error) {
				formRequiredItem.parentElement.insertAdjacentHTML(
					'beforeend',
					`<div class="form__error">${formRequiredItem.dataset.error}</div>`
				);
			}
		}
	},
	removeError(formRequiredItem) {
		formRequiredItem.classList.remove('_form-error');
		if (formRequiredItem.tagName === 'SELECT') {
			formRequiredItem.closest('.input-wrapper').classList.remove('_form-error');
		} else {
			formRequiredItem.parentElement.classList.remove('_form-error');
			if (formRequiredItem.parentElement.querySelector('.form__error')) {
				formRequiredItem.parentElement.removeChild(
					formRequiredItem.parentElement.querySelector('.form__error')
				);
			}
		}
	},
	formClean(form) {
		form.reset();

		setTimeout(() => {
			let maskInput = form.querySelector('.tel');
			if (maskInput) {
				let maskOptions = {
					mask: '+7(000)000-00-00',
					lazy: false,
				};
				let mask = new IMask(maskInput, maskOptions);
				mask.updateValue();
			}
		}, 20);

		setTimeout(() => {
			let inputs = form.querySelectorAll('input,textarea');
			for (let index = 0; index < inputs.length; index++) {
				const el = inputs[index];
				el.parentElement.classList.remove('_form-focus');
				el.classList.remove('_form-focus');
				formValidate.removeError(el);
			}
			let checkboxes = form.querySelectorAll('.checkbox__input');
			if (checkboxes.length > 0) {
				for (let index = 0; index < checkboxes.length; index++) {
					const checkbox = checkboxes[index];
					checkbox.checked = false;
				}
			}
			if (flsModules.select) {
				let selects = form.querySelectorAll('.select');
				if (selects.length) {
					for (let index = 0; index < selects.length; index++) {
						const select = selects[index].querySelector('select');
						flsModules.select.selectBuild(select);
					}
				}
			}
		}, 0);
	},
	emailTest(formRequiredItem) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
	},
};

/* Отправка форм*/
function formSubmit() {
	const forms = document.forms;
	if (forms.length) {
		for (const form of forms) {
			form.addEventListener('submit', function (e) {
				const form = e.target;
				formSubmitAction(form, e);
			});
			form.addEventListener('reset', function (e) {
				const form = e.target;
				formValidate.formClean(form);
			});
		}
	}
	async function formSubmitAction(form, e) {
		const error = !form.hasAttribute('data-no-validate') ? formValidate.getErrors(form) : 0;
		if (error === 0) {
			const ajax = form.hasAttribute('data-ajax');
			if (ajax) {
				// Если режим ajax
				e.preventDefault();
				const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
				const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'POST';
				const formData = new FormData(form);

				form.classList.add('_sending');
				const response = await fetch(formAction, {
					method: formMethod,
					body: formData,
				});
				if (response.ok) {
					let responseResult = await response.json();
					form.classList.remove('_sending');
					formSent(form, responseResult);
				} else {
					alert('Ошибка');
					form.classList.remove('_sending');
				}
			} else if (form.hasAttribute('data-dev')) {
				// Если режим разработки
				e.preventDefault();
				formSent(form);
			}
		} else {
			e.preventDefault();
			if (form.querySelector('._form-error') && form.hasAttribute('data-goto-error')) {
				const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : '._form-error';
				gotoBlock(formGoToErrorClass, true, 1000);
			}
		}
	}
	// Действия после отправки формы
	function formSent(form, responseResult = ``) {
		// Создаем событие отправки формы
		document.dispatchEvent(
			new CustomEvent('formSent', {
				detail: {
					form: form,
				},
			})
		);
		// Попап показывает, если подключен модуль попапов
		// и для формы указана настройка
		setTimeout(() => {
			if (flsModules.popup) {
				const popup = form.dataset.popupMessage;
				popup ? flsModules.popup.open(popup) : null;
			}
		}, 0);
		// Очищаем форму
		formValidate.formClean(form);
		form.parentNode.classList.add('_sent');
		console.log(form);
		if (form.classList.contains('callback-modal__form')) {
			document.querySelector('.callback-modal__body').classList.add('_sent');
			console.log(document.querySelector('.callback-modal__body'));
			console.log('class added');
		}

		// Сообщаем в консоль
		formLogging(`Форма отправлена!`);
	}
	function formLogging(message) {
		FLSLog(`[Forms]: ${message}`);
	}
}

formFieldsInit({
	viewPass: false,
	autoHeight: false,
});

formSubmit();

/*
//Настройка
Для селектора (select):
class="имя класса" -модификатор к конкретному селекту
multiple – мультивыбор
data-class-modif= "имя модификатора"
data-tags – режим тегов, только для (только для multiple)
data-scroll -включить прокрутку для выпадающего списка дополнительно можно подключить кастомный скролл simplebar в app.js. Указанное число для атрибута ограничит высоту
data-checkbox – стилизация элементов по checkbox (только для multiple)
data-show-selected – выключает сокрытие выбранного элемента
data-search -позволяет искать по выпадающему списку
data-open – селект открыт сразу
data-submit – отправляет форму при смене селлекта

data-one-select -селекты внутри оболочки с атрибутом будут показываться только по одному
data-pseudo-label – добавляет псевдоэлемент к заголовку селлекта с указанным текстом

Для плейсхолдера (плейсхолдер – это option из value=""):
data-label для плейсхолдера, добавляет label к селектору.
data-show для плейсхолдера, показывает его в списке (только для единичного выбора)

Для элемента (option):
data-class="имя класса" -добавляет класс
data-asset="путь к картинке или тексту" -добавляет структуру 2х колонок и данным
data-href="адрес ссылки" -добавляет ссылку в элемент списка
data-href-blank – откроет ссылку в новом окне
*/
// Класс постройки Select
class SelectConstructor {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
			logging: true,
			speed: 150,
		};
		this.config = Object.assign(defaultConfig, props);
		// CSS класи модуля
		this.selectClasses = {
			classSelect: 'select', // Главный блок
			classSelectBody: 'select__body', // Тело селекта
			classSelectTitle: 'select__title', // Заголовок
			classSelectValue: 'select__value', // Значение в заголовке
			classSelectLabel: 'select__label', // Лэйбел
			classSelectInput: 'select__input', // Поле ввода
			classSelectText: 'select__text', // Оболочка текстовых данных
			classSelectLink: 'select__link', // Ссылка в элементе
			classSelectOptions: 'select__options', // Выпадающий список
			classSelectOptionsScroll: 'select__scroll', // Оболочка при скроле
			classSelectOption: 'select__option', // Пункт
			classSelectContent: 'select__content', // Оболочка контента в заголовке
			classSelectRow: 'select__row', // Ряд
			classSelectData: 'select__asset', // Дополнительные данные
			classSelectDisabled: '_select-disabled', // Запрещено
			classSelectTag: '_select-tag', // Класс тега
			classSelectOpen: '_select-open', // Список открыт
			classSelectActive: '_select-active', // Список выбран
			classSelectFocus: '_select-focus', // Список в фокусе
			classSelectMultiple: '_select-multiple', // Мультипл
			classSelectCheckBox: '_select-checkbox', // Стиль чекбоксу
			classSelectOptionSelected: '_select-selected', // Выбранный пункт
			classSelectPseudoLabel: '_select-pseudo-label', // Псевдолейбл
		};
		this._this = this;
		// Запуск инициализации
		if (this.config.init) {
			// Получение всех select на странице
			const selectItems = data ? document.querySelectorAll(data) : document.querySelectorAll('select');
			if (selectItems.length) {
				this.selectsInit(selectItems);
				this.setLogging(`Проснулся, построил селекты: (${selectItems.length})`);
			} else {
				this.setLogging('Сплю, не вижу ни одного селекта');
			}
		}
	}
	// Конструктор CSS класса
	getSelectClass(className) {
		return `.${className}`;
	}
	// Геттер элементов псевдоселлекта
	getSelectElement(selectItem, className) {
		return {
			originalSelect: selectItem.querySelector('select'),
			selectElement: selectItem.querySelector(this.getSelectClass(className)),
		};
	}
	// Функция инициализации всех селлектов
	selectsInit(selectItems) {
		selectItems.forEach((originalSelect, index) => {
			this.selectInit(originalSelect, index + 1);
		});
		// Обработчики событий...
		// ...при клике
		document.addEventListener(
			'click',
			function (e) {
				this.selectsActions(e);
			}.bind(this)
		);
		// ...при нажатии клавиши
		document.addEventListener(
			'keydown',
			function (e) {
				this.selectsActions(e);
			}.bind(this)
		);
		// ...при фокусе
		document.addEventListener(
			'focusin',
			function (e) {
				this.selectsActions(e);
			}.bind(this)
		);
		// ...при потере фокуса
		document.addEventListener(
			'focusout',
			function (e) {
				this.selectsActions(e);
			}.bind(this)
		);
	}
	// Функция инициализации конкретного селекта
	selectInit(originalSelect, index) {
		const _this = this;
		// Создаем оболочку
		let selectItem = document.createElement('div');
		selectItem.classList.add(this.selectClasses.classSelect);
		// Выводим оболочку перед оригинальным селектом
		originalSelect.parentNode.insertBefore(selectItem, originalSelect);
		// Помещаем оригинальный селект в оболочку
		selectItem.appendChild(originalSelect);
		// Скрываем оригинальный селект
		originalSelect.hidden = true;
		// Присваиваем уникальный ID
		index ? (originalSelect.dataset.id = index) : null;

		// Работа с плейсхолдером
		if (this.getSelectPlaceholder(originalSelect)) {
			// Запоминаем плейсхолдер
			originalSelect.dataset.placeholder = this.getSelectPlaceholder(originalSelect).value;
			// Если включен режим label
			if (this.getSelectPlaceholder(originalSelect).label.show) {
				const selectItemTitle = this.getSelectElement(
					selectItem,
					this.selectClasses.classSelectTitle
				).selectElement;
				selectItemTitle.insertAdjacentHTML(
					'afterbegin',
					`<span class="${this.selectClasses.classSelectLabel}">${
						this.getSelectPlaceholder(originalSelect).label.text
							? this.getSelectPlaceholder(originalSelect).label.text
							: this.getSelectPlaceholder(originalSelect).value
					}</span>`
				);
			}
		}
		// Конструктор основных элементов
		selectItem.insertAdjacentHTML(
			'beforeend',
			`<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`
		);
		// Запускаем конструктор псевдоселлекта
		this.selectBuild(originalSelect);

		// Запоминаем скорость
		originalSelect.dataset.speed = originalSelect.dataset.speed ? originalSelect.dataset.speed : this.config.speed;
		this.config.speed = +originalSelect.dataset.speed;

		// Событие при смене оригинального select
		originalSelect.addEventListener('change', function (e) {
			_this.selectChange(e);
		});
	}
	// Конструктор псевдоселекту
	selectBuild(originalSelect) {
		const selectItem = originalSelect.parentElement;
		// Добавляем ID селектора
		selectItem.dataset.id = originalSelect.dataset.id;
		// Получаем класс оригинального селлекта, создаем модификатор и добавляем его.
		originalSelect.dataset.classModif
			? selectItem.classList.add(`select_${originalSelect.dataset.classModif}`)
			: null;
		// Если множественный выбор, добавляем класс
		originalSelect.multiple
			? selectItem.classList.add(this.selectClasses.classSelectMultiple)
			: selectItem.classList.remove(this.selectClasses.classSelectMultiple);
		// Cтилизация элементов под checkbox (только для multiple)
		originalSelect.hasAttribute('data-checkbox') && originalSelect.multiple
			? selectItem.classList.add(this.selectClasses.classSelectCheckBox)
			: selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
		// Сеттер значение заголовка селлекта
		this.setSelectTitleValue(selectItem, originalSelect);
		// Сеттер списков (options)
		this.setOptions(selectItem, originalSelect);
		// Если включена опция поиска data-search, запускаем обработчик
		originalSelect.hasAttribute('data-search') ? this.searchActions(selectItem) : null;
		// Если указана настройка data-open, открываем селект
		originalSelect.hasAttribute('data-open') ? this.selectAction(selectItem) : null;
		// Обработчик disabled
		this.selectDisabled(selectItem, originalSelect);
	}
	// Функция реакций на события
	selectsActions(e) {
		const targetElement = e.target;
		const targetType = e.type;
		if (
			targetElement.closest(this.getSelectClass(this.selectClasses.classSelect)) ||
			targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag))
		) {
			const selectItem = targetElement.closest('.select')
				? targetElement.closest('.select')
				: document.querySelector(
						`.${this.selectClasses.classSelect}[data-id="${
							targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag)).dataset
								.selectId
						}"]`
				  );
			const originalSelect = this.getSelectElement(selectItem).originalSelect;
			if (targetType === 'click') {
				if (!originalSelect.disabled) {
					if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag))) {
						// Обработка клика по тегу
						const targetTag = targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTag));
						const optionItem = document.querySelector(
							`.${this.selectClasses.classSelect}[data-id="${targetTag.dataset.selectId}"] .select__option[data-value="${targetTag.dataset.value}"]`
						);
						this.optionAction(selectItem, originalSelect, optionItem);
					} else if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectTitle))) {
						// Обработка клика на заглавие селекта
						this.selectAction(selectItem);
					} else if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelectOption))) {
						// Обработка клика на элемент селектора
						const optionItem = targetElement.closest(
							this.getSelectClass(this.selectClasses.classSelectOption)
						);
						this.optionAction(selectItem, originalSelect, optionItem);
					}
				}
			} else if (targetType === 'focusin' || targetType === 'focusout') {
				if (targetElement.closest(this.getSelectClass(this.selectClasses.classSelect))) {
					targetType === 'focusin'
						? selectItem.classList.add(this.selectClasses.classSelectFocus)
						: selectItem.classList.remove(this.selectClasses.classSelectFocus);
				}
			} else if (targetType === 'keydown' && e.code === 'Escape') {
				this.selectsСlose();
			}
		} else {
			this.selectsСlose();
		}
	}
	// Функция закрытия всех селекторов
	selectsСlose(selectOneGroup) {
		const selectsGroup = selectOneGroup ? selectOneGroup : document;
		const selectActiveItems = selectsGroup.querySelectorAll(
			`${this.getSelectClass(this.selectClasses.classSelect)}${this.getSelectClass(
				this.selectClasses.classSelectOpen
			)}`
		);
		if (selectActiveItems.length) {
			selectActiveItems.forEach((selectActiveItem) => {
				this.selectСlose(selectActiveItem);
			});
		}
	}
	// Функция закрытия конкретного селекта
	selectСlose(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		if (!selectOptions.classList.contains('_slide')) {
			selectItem.classList.remove(this.selectClasses.classSelectOpen);
			_slideUp(selectOptions, originalSelect.dataset.speed);
			setTimeout(() => {
				selectItem.style.zIndex = '';
			}, originalSelect.dataset.speed);
		}
	}
	// Функция открытия/закрытия конкретного селекта
	selectAction(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectOpenzIndex = originalSelect.dataset.zIndex ? originalSelect.dataset.zIndex : 3;

		// Определяем, где отобразить выпадающий список
		this.setOptionsPosition(selectItem);

		// Если селективы размещены в элементе с атрибутом дата data-one-select
		// закрываем все открытые селекты
		if (originalSelect.closest('[data-one-select]')) {
			const selectOneGroup = originalSelect.closest('[data-one-select]');
			this.selectsСlose(selectOneGroup);
		}

		setTimeout(() => {
			if (!selectOptions.classList.contains('_slide')) {
				selectItem.classList.toggle(this.selectClasses.classSelectOpen);
				_slideToggle(selectOptions, originalSelect.dataset.speed);

				if (selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
					selectItem.style.zIndex = selectOpenzIndex;
				} else {
					setTimeout(() => {
						selectItem.style.zIndex = '';
					}, originalSelect.dataset.speed);
				}
			}
		}, 0);
	}
	// Сеттер значение заголовка селлекта
	setSelectTitleValue(selectItem, originalSelect) {
		const selectItemBody = this.getSelectElement(selectItem, this.selectClasses.classSelectBody).selectElement;
		const selectItemTitle = this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement;
		if (selectItemTitle) selectItemTitle.remove();
		selectItemBody.insertAdjacentHTML('afterbegin', this.getSelectTitleValue(selectItem, originalSelect));
		originalSelect.hasAttribute('data-search') ? this.searchActions(selectItem) : null;
	}
	// Конструктор значение заголовка
	getSelectTitleValue(selectItem, originalSelect) {
		// Получаем выбранные текстовые значения
		let selectTitleValue = this.getSelectedOptionsData(originalSelect, 2).html;
		// Обработка значений мультивыбора
		// Если режим тегов включен (указана настройка data-tags)
		if (originalSelect.multiple && originalSelect.hasAttribute('data-tags')) {
			selectTitleValue = this.getSelectedOptionsData(originalSelect)
				.elements.map(
					(option) =>
						`<span role="button" data-select-id="${selectItem.dataset.id}" data-value="${
							option.value
						}" class="_select-tag">${this.getSelectElementContent(option)}</span>`
				)
				.join('');
			// Если вывод тегов во внешний блок
			if (originalSelect.dataset.tags && document.querySelector(originalSelect.dataset.tags)) {
				document.querySelector(originalSelect.dataset.tags).innerHTML = selectTitleValue;
				if (originalSelect.hasAttribute('data-search')) selectTitleValue = false;
			}
		}
		// Значение или плейсхолдер
		selectTitleValue = selectTitleValue.length
			? selectTitleValue
			: originalSelect.dataset.placeholder
			? originalSelect.dataset.placeholder
			: '';
		// Если включен режим pseudo
		let pseudoAttribute = '';
		let pseudoAttributeClass = '';
		if (originalSelect.hasAttribute('data-pseudo-label')) {
			pseudoAttribute = originalSelect.dataset.pseudoLabel
				? ` data-pseudo-label="${originalSelect.dataset.pseudoLabel}"`
				: ` data-pseudo-label="Заповніть атрибут"`;
			pseudoAttributeClass = ` ${this.selectClasses.classSelectPseudoLabel}`;
		}
		// Если есть значение, добавляем класс
		this.getSelectedOptionsData(originalSelect).values.length
			? selectItem.classList.add(this.selectClasses.classSelectActive)
			: selectItem.classList.remove(this.selectClasses.classSelectActive);
		// Возвращаем поле ввода для поиска или текст
		if (originalSelect.hasAttribute('data-search')) {
			// Выводим поле ввода для поиска
			return `<div class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}"><input autocomplete="off" type="text" placeholder="${selectTitleValue}" data-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
		} else {
			// Если выбран элемент со своим классом
			const customClass =
				this.getSelectedOptionsData(originalSelect).elements.length &&
				this.getSelectedOptionsData(originalSelect).elements[0].dataset.class
					? ` ${this.getSelectedOptionsData(originalSelect).elements[0].dataset.class}`
					: '';
			// Выводим текстовое значение
			return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span${pseudoAttribute} class="${this.selectClasses.classSelectValue}${pseudoAttributeClass}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
		}
	}
	// Конструктор данных для значения заголовка
	getSelectElementContent(selectOption) {
		// Если для элемента указан вывод картинки или текста, перестраиваем конструкцию
		const selectOptionData = selectOption.dataset.asset ? `${selectOption.dataset.asset}` : '';
		const selectOptionDataHTML =
			selectOptionData.indexOf('img') >= 0 ? `<img src="${selectOptionData}" alt="">` : selectOptionData;
		let selectOptionContentHTML = ``;
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectRow}">` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectData}">` : '';
		selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `<span class="${this.selectClasses.classSelectText}">` : '';
		selectOptionContentHTML += selectOption.textContent;
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		selectOptionContentHTML += selectOptionData ? `</span>` : '';
		return selectOptionContentHTML;
	}
	// Получение данных плейсхолдера
	getSelectPlaceholder(originalSelect) {
		const selectPlaceholder = Array.from(originalSelect.options).find((option) => !option.value);
		if (selectPlaceholder) {
			return {
				value: selectPlaceholder.textContent,
				show: selectPlaceholder.hasAttribute('data-show'),
				label: {
					show: selectPlaceholder.hasAttribute('data-label'),
					text: selectPlaceholder.dataset.label,
				},
			};
		}
	}
	// Получение данных из выбранных элементов
	getSelectedOptionsData(originalSelect, type) {
		//Получаем все выбранные объекты из select
		let selectedOptions = [];
		if (originalSelect.multiple) {
			// Если мультивыбор
			// Забираем плейсхолдер, получаем остальные избранные элементы
			selectedOptions = Array.from(originalSelect.options)
				.filter((option) => option.value)
				.filter((option) => option.selected);
		} else {
			// Если единичный выбор
			selectedOptions.push(originalSelect.options[originalSelect.selectedIndex]);
		}
		return {
			elements: selectedOptions.map((option) => option),
			values: selectedOptions.filter((option) => option.value).map((option) => option.value),
			html: selectedOptions.map((option) => this.getSelectElementContent(option)),
		};
	}
	// Конструктор элементов списка
	getOptions(originalSelect) {
		// Настройка скролла элементов
		let selectOptionsScroll = originalSelect.hasAttribute('data-scroll') ? `data-simplebar` : '';
		// Получаем элементы списка
		let selectOptions = Array.from(originalSelect.options);
		if (selectOptions.length > 0) {
			let selectOptionsHTML = ``;
			// Если указана настройка data-show, показываем плейсхолдер в списке
			if (
				(this.getSelectPlaceholder(originalSelect) && !this.getSelectPlaceholder(originalSelect).show) ||
				originalSelect.multiple
			) {
				selectOptions = selectOptions.filter((option) => option.value);
			}
			// Строим и выводим основную конструкцию
			selectOptionsHTML += `<div ${selectOptionsScroll} class="${this.selectClasses.classSelectOptionsScroll}">`;
			selectOptions.forEach((selectOption) => {
				// Получаем конструкцию конкретного элемента списка
				selectOptionsHTML += this.getOption(selectOption, originalSelect);
			});
			selectOptionsHTML += `</div>`;
			return selectOptionsHTML;
		}
	}
	// Конструктор конкретного элемента списка
	getOption(selectOption, originalSelect) {
		// Если элемент выбран и включен режим мультивыбора, добавляем класс
		const selectOptionSelected =
			selectOption.selected && originalSelect.multiple ? ` ${this.selectClasses.classSelectOptionSelected}` : '';
		// Если элемент выбран и нет настройки data-show-selected, скрываем элемент
		const selectOptionHide =
			selectOption.selected && !originalSelect.hasAttribute('data-show-selected') && !originalSelect.multiple
				? `hidden`
				: ``;
		// Если для элемента указанный класс добавляем
		const selectOptionClass = selectOption.dataset.class ? ` ${selectOption.dataset.class}` : '';
		// Если указан режим ссылки
		const selectOptionLink = selectOption.dataset.href ? selectOption.dataset.href : false;
		const selectOptionLinkTarget = selectOption.hasAttribute('data-href-blank') ? `target="_blank"` : '';
		// Строим и возвращаем конструкцию элемента
		let selectOptionHTML = ``;
		selectOptionHTML += selectOptionLink
			? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">`
			: `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-value="${selectOption.value}" type="button">`;
		selectOptionHTML += this.getSelectElementContent(selectOption);
		selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
		return selectOptionHTML;
	}
	// Сеттер списков (options)
	setOptions(selectItem, originalSelect) {
		// Получаем объект тела псевдоселлекта
		const selectItemOptions = this.getSelectElement(
			selectItem,
			this.selectClasses.classSelectOptions
		).selectElement;
		// Запускаем конструктор элементов списка (options) и добавляем в тело псевдоселектора
		selectItemOptions.innerHTML = this.getOptions(originalSelect);
	}
	// Определяем, где отобразить выпадающий список
	setOptionsPosition(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectItemScroll = this.getSelectElement(
			selectItem,
			this.selectClasses.classSelectOptionsScroll
		).selectElement;
		const customMaxHeightValue = +originalSelect.dataset.scroll ? `${+originalSelect.dataset.scroll}px` : ``;
		const selectOptionsPosMargin = +originalSelect.dataset.optionsMargin
			? +originalSelect.dataset.optionsMargin
			: 10;

		if (!selectItem.classList.contains(this.selectClasses.classSelectOpen)) {
			selectOptions.hidden = false;
			const selectItemScrollHeight = selectItemScroll.offsetHeight
				? selectItemScroll.offsetHeight
				: parseInt(window.getComputedStyle(selectItemScroll).getPropertyValue('max-height'));
			const selectOptionsHeight =
				selectOptions.offsetHeight > selectItemScrollHeight
					? selectOptions.offsetHeight
					: selectItemScrollHeight + selectOptions.offsetHeight;
			const selectOptionsScrollHeight = selectOptionsHeight - selectItemScrollHeight;
			selectOptions.hidden = true;

			const selectItemHeight = selectItem.offsetHeight;
			const selectItemPos = selectItem.getBoundingClientRect().top;
			const selectItemTotal = selectItemPos + selectOptionsHeight + selectItemHeight + selectOptionsScrollHeight;
			const selectItemResult = window.innerHeight - (selectItemTotal + selectOptionsPosMargin);

			if (selectItemResult < 0) {
				const newMaxHeightValue = selectOptionsHeight + selectItemResult;
				if (newMaxHeightValue < 100) {
					selectItem.classList.add('select_show-top');
					selectItemScroll.style.maxHeight =
						selectItemPos < selectOptionsHeight
							? `${selectItemPos - (selectOptionsHeight - selectItemPos)}px`
							: customMaxHeightValue;
				} else {
					selectItem.classList.remove('select_show-top');
					selectItemScroll.style.maxHeight = `${newMaxHeightValue}px`;
				}
			}
		} else {
			setTimeout(() => {
				selectItem.classList.remove('select_show-top');
				selectItemScroll.style.maxHeight = customMaxHeightValue;
			}, +originalSelect.dataset.speed);
		}
	}
	// Обработчик клика на пункт списка
	optionAction(selectItem, originalSelect, optionItem) {
		const selectOptions = selectItem.querySelector(`${this.getSelectClass(this.selectClasses.classSelectOptions)}`);
		if (!selectOptions.classList.contains('_slide')) {
			if (originalSelect.multiple) {
				// Если мультивыбор
				// Выделяем классом элемент
				optionItem.classList.toggle(this.selectClasses.classSelectOptionSelected);
				// Очищаем выбранные элементы
				const originalSelectSelectedItems = this.getSelectedOptionsData(originalSelect).elements;
				originalSelectSelectedItems.forEach((originalSelectSelectedItem) => {
					originalSelectSelectedItem.removeAttribute('selected');
				});
				// Выбираем элементы
				const selectSelectedItems = selectItem.querySelectorAll(
					this.getSelectClass(this.selectClasses.classSelectOptionSelected)
				);
				selectSelectedItems.forEach((selectSelectedItems) => {
					originalSelect
						.querySelector(`option[value = "${selectSelectedItems.dataset.value}"]`)
						.setAttribute('selected', 'selected');
				});
			} else {
				// Если единичный выбор
				// Если не указана настройка data-show-selected, скрываем выбранный элемент
				if (!originalSelect.hasAttribute('data-show-selected')) {
					setTimeout(() => {
						// Сначала все показать
						if (
							selectItem.querySelector(
								`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`
							)
						) {
							selectItem.querySelector(
								`${this.getSelectClass(this.selectClasses.classSelectOption)}[hidden]`
							).hidden = false;
						}
						// Скрываем избранное
						optionItem.hidden = true;
					}, this.config.speed);
				}
				originalSelect.value = optionItem.hasAttribute('data-value')
					? optionItem.dataset.value
					: optionItem.textContent;
				this.selectAction(selectItem);
			}
			//Обновляем заголовок селекта
			this.setSelectTitleValue(selectItem, originalSelect);
			// Вызываем реакцию на смену селлекта
			this.setSelectChange(originalSelect);
		}
	}
	// Реакция на изменение оригинального select
	selectChange(e) {
		const originalSelect = e.target;
		this.selectBuild(originalSelect);
		this.setSelectChange(originalSelect);
	}
	// Обработчик смены в селекторе
	setSelectChange(originalSelect) {
		// Мгновенная валидация селлекта
		if (originalSelect.hasAttribute('data-validate')) {
			formValidate.validateInput(originalSelect);
		}
		// При смене селлекта присылаем форму
		if (originalSelect.hasAttribute('data-submit') && originalSelect.value) {
			let tempButton = document.createElement('button');
			tempButton.type = 'submit';
			originalSelect.closest('form').append(tempButton);
			tempButton.click();
			tempButton.remove();
		}
		const selectItem = originalSelect.parentElement;
		// Вызов коллбек функции
		this.selectCallback(selectItem, originalSelect);
	}
	// Обработчик disabled
	selectDisabled(selectItem, originalSelect) {
		if (originalSelect.disabled) {
			selectItem.classList.add(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = true;
		} else {
			selectItem.classList.remove(this.selectClasses.classSelectDisabled);
			this.getSelectElement(selectItem, this.selectClasses.classSelectTitle).selectElement.disabled = false;
		}
	}
	// Обработчик поиска по элементам списка
	searchActions(selectItem) {
		const originalSelect = this.getSelectElement(selectItem).originalSelect;
		const selectInput = this.getSelectElement(selectItem, this.selectClasses.classSelectInput).selectElement;
		const selectOptions = this.getSelectElement(selectItem, this.selectClasses.classSelectOptions).selectElement;
		const selectOptionsItems = selectOptions.querySelectorAll(`.${this.selectClasses.classSelectOption} `);
		const _this = this;
		selectInput.addEventListener('input', function () {
			selectOptionsItems.forEach((selectOptionsItem) => {
				if (selectOptionsItem.textContent.toUpperCase().includes(selectInput.value.toUpperCase())) {
					selectOptionsItem.hidden = false;
				} else {
					selectOptionsItem.hidden = true;
				}
			});
			// Если список закрыт открываем
			selectOptions.hidden === true ? _this.selectAction(selectItem) : null;
		});
	}
	// Коллбек функция
	selectCallback(selectItem, originalSelect) {
		document.dispatchEvent(
			new CustomEvent('selectCallback', {
				detail: {
					select: originalSelect,
				},
			})
		);
	}
	// Логинг в консоль
	setLogging(message) {
		this.config.logging ? FLSLog(`[select]: ${message} `) : null;
	}
}
flsModules.select = new SelectConstructor({});

function buildSliders() {
	let sliders = document.querySelectorAll('[class*="__swiper"]:not(.swiper-wrapper)');
	if (sliders) {
		sliders.forEach((slider) => {
			slider.parentElement.classList.add('swiper');
			slider.classList.add('swiper-wrapper');
			for (const slide of slider.children) {
				slide.classList.add('swiper-slide');
			}
		});
	}
}

// Инициализация слайдеров
function initSliders() {
	// Список слайдеров
	// Проверяем, есть ли слайдер на странице
	if (document.querySelector('.slider-models')) {
		let filterOrigin;

		// Указываем класс нужного слайдера
		// Создаем слайдер
		new Swiper('.slider-models', {
			// Указываем класс нужного слайдера
			// Подключаем модули слайдера
			// для конкретного случая
			observer: true,
			observeParents: true,
			slidesPerView: 2.8,
			spaceBetween: 0,
			grabCursor: true,
			centeredSlides: true,
			initialSlide: 2,
			// autoHeight: true,
			speed: 800,

			effect: 'coverflow',
			coverflowEffect: {
				rotate: 0,
				stretch: 190,
				depth: 150,
				modifier: 1,
				slideShadows: true,
			},

			//touchRatio: 0,
			//simulateTouch: false,
			// loop: true,
			//preloadImages: false,
			//lazy: true,

			/*
			// Эффекты
			effect: 'fade',
			autoplay: {
				delay: 3000,
				disableOnInteraction: false,
			},
			*/

			pagination: {
				el: '.slider-models .slider-controlls__dots',
				clickable: true,
			},

			// Полоса прокрутки
			/*
			scrollbar: {
				el: '.swiper-scrollbar',
				draggable: true,
			},
			*/

			// Кнопки "влево/вправо"
			// navigation: {
			// 	prevEl: '.swiper-button-prev',
			// 	nextEl: '.swiper-button-next',
			// },

			breakpoints: {
				320: {
					slidesPerView: 1.2,
				},
				640: {
					slidesPerView: 1.6,
				},
				768: {
					slidesPerView: 2,
				},
				991.98: {
					slidesPerView: 2.8,
					spaceBetween: 0,
				},
			},
			// События
			on: {
				init: (e) => {
					filterOrigin = window.getComputedStyle(e.slides[0]).filter;
				},
				slideChange: (e) => {
					setTimeout(() => {
						setBlur(e);
					}, 10);

					let clickedSlider = document.querySelector('.slider-models__slide._clicked');
					if (clickedSlider) {
						clickedSlider.classList.remove('_clicked');
					}
				},
			},
		});

		function setBlur(e) {
			let slidesCount = e.slides.length - 1;
			let diff = Math.abs(slidesCount - e.realIndex);
			let maxSlidesFromCenter = null;

			if (diff >= e.realIndex) {
				maxSlidesFromCenter = diff;
			} else {
				maxSlidesFromCenter = e.realIndex;
			}

			let blurAr = buildBlur(e, maxSlidesFromCenter);
			let blurArReverse = Array.from(blurAr).reverse();

			let passCenter = false;

			let normalIndex = 0;
			let reverseIndex = 0;
			e.slides.forEach((slide, index) => {
				if (index > e.realIndex) {
					passCenter = true;
				}

				if (index !== e.realIndex) {
					if (!passCenter) {
						slide.style.filter = blurArReverse[reverseIndex++];
					} else {
						slide.style.filter = blurAr[normalIndex++];
					}
				} else {
					slide.style.filter = filterOrigin;
				}
			});
		}

		function buildBlur(e) {
			let slidesCount = e.slides.length - 1;
			let diff = Math.abs(slidesCount - e.realIndex);
			let maxSlidesFromCenter = null;

			if (diff >= e.realIndex) {
				maxSlidesFromCenter = diff;
			} else {
				maxSlidesFromCenter = e.realIndex;
			}

			let blurAr = [];
			for (let i = 0; i < maxSlidesFromCenter; i++) {
				blurAr.push(`${filterOrigin} blur(${i + 1}px)`);
			}
			return blurAr;
		}
	}
}

window.addEventListener('load', function (e) {
	buildSliders();
	initSliders();
});

window.addEventListener('load', (windowEvent) => {
	let phoneInputs = document.querySelectorAll('.tel');

	if (phoneInputs.length) {
		let maskOptions = {
			mask: '+7(000)-000-00-00',
			lazy: false,
		};

		phoneInputs.forEach((input) => {
			let mask = new IMask(input, maskOptions);
			let formInput = input.closest('form').addEventListener('reset', (e) => {
				mask.destroy();
			});
		});
	}
});

isWebp();
spollers();

new SimpleBar(document.querySelector('.calculator-total__list'));