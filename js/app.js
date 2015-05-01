/**
 * Created by Vadim Loginov on 30.04.2015.
 */

angular.module('app', [])

    // Настройки
    .constant('config', {
        ajaxUrl: 'servermock/directives.php'
    })

    // Директива для кнопки с выпадающим списком (варианты ответа)
    .directive('dropdown', ['config', '$http', function (config, $http) {
        return {
            restrict: 'E',
            template: '<button class="dropdown">\n    <span>San Francisco</span>\n</button>\n<div class="options">\n    <div class="option" ng-repeat="option in options.list" ng-bind="option" ng-click="optionChosen(option)"></div>\n</div>',
            link: function (scope, element, attrs) {
                // options - объект с массивом вопросов и правильным ответом
                var options,
                    button = element.find('button'),
                    buttonCaption =  button.find('span'),
                    dropdown = element.find('div'),
                    currentOption = 0;

                // Для работы нам обязательно нужен id, так сервер будет узнавать директиву
                if (!attrs.id) {
                    console.log('You missed id for the dropdown directive!');
                    return;
                }
                // Загружаем данные о вариантах ответа
                $http.get(config.ajaxUrl + '?id=' + attrs.id)
                    .success(function(data) {
                        // Создаём пустышку
                        data.list.unshift(' ');
                        scope.options = data;
                        buttonCaption.text('');
                    })
                    .error(function() {
                        console.log('Error while getting data from server (dropdown id=' + attrs.id + ')');
                    });
                // Обработчик для открытия выпадающего меню
                button.on('keydown', function (e) {
                    // 40 - arrow down, 38 - arrow up, 32 - space, 13 - enter
                    if (!isDropdownOpened() && (e.which === 13 || e.which === 40 || e.which === 32)) {
                        openDropdown();
                    } else if (e.which === 13) {
                        // выбор варианта
                        scope.optionChosen(scope.options.list[currentOption]);
                        closeDropdown();
                    } else if (e.which === 40) {
                        // список уже был открыт, значит нужно перенести фокус вниз
                        focusDown();
                    } else if (e.which === 38 && isDropdownOpened()) {
                        // переносим фокус вверх
                        focusUp();
                    }
                    else if (e.which === 27) {
                        closeDropdown();
                    }
                    // Предотвратим прокручивание страницы при нажатии стрелок вверх/вниз
                    e.preventDefault();
                });
                element.on('mouseup', toggleDropdown);

                function focusDown() {
                    currentOption = (currentOption == scope.options.list.length - 1) ? 0 : currentOption + 1;
                    selectOption(currentOption);
                }
                function focusUp() {
                    currentOption = (currentOption == 0) ? scope.options.list.length - 1 : currentOption - 1;
                    selectOption(currentOption);
                }
                function selectOption(n) {
                    dropdown.find('div').removeClass('selected');
                    angular.element(dropdown.find('div')[n]).addClass('selected');
                    buttonCaption.text(scope.options.list[n]);
                }
                function isDropdownOpened() {
                    return dropdown.hasClass('opened');
                }
                function openDropdown() {
                    button.removeClass('wrong').removeClass('right');
                    dropdown.addClass('opened');
                    selectOption(currentOption);
                }
                function closeDropdown() {
                    dropdown.removeClass('opened');
                }
                function toggleDropdown() {
                    isDropdownOpened() ? closeDropdown() : openDropdown();
                }
                // Обработчик выбора варианта
                scope.optionChosen = function (option) {
                    currentOption = scope.options.list.indexOf(option);
                    selectOption(currentOption);
                    buttonCaption.text(option);
                    dropdown.find('div').removeClass('chosen');
                    if (option === scope.options.list[0]) {
                        // выбрана пустышка
                        button.removeClass('wrong').removeClass('right');
                    } else {
                        if (option === scope.options.answer) {
                            // выбран правильный ответ
                            button.removeClass('wrong').addClass('right');
                        } else {
                            // выбран неправильный ответ
                            button.removeClass('right').addClass('wrong');
                        }
                        // Установим галку
                        angular.element(dropdown.children()[scope.options.list.indexOf(option)]).addClass('chosen');
                    }

                    console.log('Dropdown ' +  attrs.id + ': chosen option "' + option + '"');
                };

            }
        }
    }]);