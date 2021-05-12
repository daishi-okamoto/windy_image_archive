$(document).ready(function() {
    'use strict';

    const START_YEAR = 2021;

    const JOB_SCHEDULED_TIME_MIN = 40;

    const AUTO_PLAY_STATUS = {
        STOP: 0,
        PLAY: 1,
        REVERSE: 2
    };

    const ANIMATION_DURATION_MANUAL = 100;
    const ANIMATION_DURATION_AUTO = 200;

    const KEY_CODE_LEFT = 37;
    const KEY_CODE_RIGHT = 39;

    const ELEM_NAME_INPUT_AREA = 'input[name=area]';
    const ELEM_NAME_INPUT_TYPE = 'input[name=type]';
    const ELEM_NAME_SELECT_YEAR = 'select[name=year]';
    const ELEM_NAME_SELECT_MONTH = 'select[name=month]';
    const ELEM_NAME_SELECT_DAY = 'select[name=day]';
    const ELEM_NAME_SELECT_HOUR = 'select[name=hour]';
    const ELEM_NAME_INPUT_AUTO_PLAY = 'input[name=autoplay]';
    const ELEM_NAME_SELECT_SPEED = 'select[name=speed]';
    const ELEM_NAME_PREV_BUTTON = '#PrevButton';
    const ELEM_NAME_NEXT_BUTTON = '#NextButton';
    const ELEM_NAME_WINDY_IMAGE = '#WindyImage';
    const CLASS_NAME_PLAY = 'Play';
    const CLASS_NAME_PAUSE = 'Pause';

    var autoPlayTimer = null;
    var autoPlayStatus = AUTO_PLAY_STATUS.STOP;

    //
    // initialize
    //
    initYearOptions();
    initDayOptions((new Date()).getFullYear(), (new Date()).getMonth() + 1);
    initDateSelect();
    resetWindyImage();

    //
    // events
    //
    $(this).keydown(function(event) {
        switch (event.keyCode) {
            case KEY_CODE_LEFT:
                if (autoPlayStatus !== AUTO_PLAY_STATUS.STOP) {
                    stopAutoPlay();
                }
                prevHour();
                break;
            case KEY_CODE_RIGHT:
                if (autoPlayStatus !== AUTO_PLAY_STATUS.STOP) {
                    stopAutoPlay();
                }
                nextHour();
                break;
            default:
                break;
        }
    });

    $(ELEM_NAME_INPUT_AREA).change(function() {
        stopAutoPlay();
        resetWindyImage();
    });

    $(ELEM_NAME_INPUT_TYPE).change(function() {
        stopAutoPlay();
        resetWindyImage();
    });

    $(ELEM_NAME_SELECT_YEAR).change(function() {
        stopAutoPlay();
        resetWindyImage();
    });

    $(ELEM_NAME_SELECT_MONTH).change(function() {
        stopAutoPlay();
        const year = $(ELEM_NAME_SELECT_YEAR + ' > option:selected').val();
        const month = $(ELEM_NAME_SELECT_MONTH + ' > option:selected').val()
        initDayOptions(year, month);
        resetWindyImage();
    });

    $(ELEM_NAME_SELECT_DAY).change(function() {
        stopAutoPlay();
        resetWindyImage();
    });

    $(ELEM_NAME_SELECT_HOUR).change(function() {
        stopAutoPlay();
        resetWindyImage();
    });

    $(ELEM_NAME_PREV_BUTTON).click(function() {
        if ($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked')) {
            switch (autoPlayStatus) {
                case AUTO_PLAY_STATUS.STOP:
                case AUTO_PLAY_STATUS.PLAY:
                    startAutoPlay(AUTO_PLAY_STATUS.REVERSE);
                    break;
                case AUTO_PLAY_STATUS.REVERSE:
                    stopAutoPlay();
                    break;
                default:
                    console.assert(false, 'autoPlayStatus=' + autoPlayStatus);
                    break;
            }
        } else {
            prevHour();
        }
    });

    $(ELEM_NAME_NEXT_BUTTON).click(function() {
        if ($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked')) {
            switch (autoPlayStatus) {
                case AUTO_PLAY_STATUS.STOP:
                case AUTO_PLAY_STATUS.REVERSE:
                    startAutoPlay(AUTO_PLAY_STATUS.PLAY);
                    break;
                case AUTO_PLAY_STATUS.PLAY:
                    stopAutoPlay();
                    break;
                default:
                    console.assert(false, 'autoPlayStatus=' + autoPlayStatus);
                    break;
            }
        } else {
            nextHour();
        }
    });

    $(ELEM_NAME_INPUT_AUTO_PLAY).change(function() {
        // $(ELEM_NAME_SELECT_SPEED).prop('disabled', !$(this).prop('checked'));
        stopAutoPlay();
    });

    $(ELEM_NAME_SELECT_SPEED).change(function() {
        console.log($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked'));
        if ($(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked')) {
            switch (autoPlayStatus) {
                case AUTO_PLAY_STATUS.PLAY:
                case AUTO_PLAY_STATUS.REVERSE:
                    startAutoPlay(null);
                case AUTO_PLAY_STATUS.STOP:
                    break;
                default:
                    console.assert(false, 'autoPlayStatus=' + autoPlayStatus);
                    break;
            }
        } else {
            $(ELEM_NAME_INPUT_AUTO_PLAY).prop('checked', true);
        }
    });

    //
    // functions
    //
    function prevHour() {
        if ($(ELEM_NAME_WINDY_IMAGE + '> div').length > 1) {
            return;
        }

        var currentElement = $(ELEM_NAME_SELECT_HOUR + ' > option:selected');
        var newElement = currentElement.prev('option');
        if (newElement.length === 0) {
            if (prevDay()) {
                newElement = $(ELEM_NAME_SELECT_HOUR + ' > option').last();
            } else {
                return;
            }
        }
        $(ELEM_NAME_SELECT_HOUR).val(newElement.val());
        resetWindyImage();
    }

    function nextHour() {
        if ($(ELEM_NAME_WINDY_IMAGE + '> div').length > 1) {
            return;
        }

        var currentElement = $(ELEM_NAME_SELECT_HOUR + ' > option:selected');
        var newElement = currentElement.next('option');
        if (newElement.length === 0) {
            if (nextDay()) {
                newElement = $(ELEM_NAME_SELECT_HOUR + ' > option').first();
            } else {
                return;
            }
        }
        $(ELEM_NAME_SELECT_HOUR).val(newElement.val());
        resetWindyImage();
    }

    function prevDay() {
        var currentElement = $(ELEM_NAME_SELECT_DAY + ' > option:selected');
        var newElement = currentElement.prev('option');
        if (newElement.length === 0) {
            if (prevMonth()) {
                newElement = $(ELEM_NAME_SELECT_DAY + ' > option').last();
            } else {
                return false;
            }
        }
        $(ELEM_NAME_SELECT_DAY).val(newElement.val());
        return true;
    }

    function nextDay() {
        var currentElement = $(ELEM_NAME_SELECT_DAY + ' > option:selected');
        var newElement = currentElement.next('option');
        if (newElement.length === 0) {
            if (nextMonth()) {
                newElement = $(ELEM_NAME_SELECT_DAY + ' > option').first();
            } else {
                return false;
            }
        }
        $(ELEM_NAME_SELECT_DAY).val(newElement.val());
        return true;
    }

    function prevMonth() {
        var currentElement = $(ELEM_NAME_SELECT_MONTH + ' > option:selected');
        var newElement = currentElement.prev('option');
        if (newElement.length === 0) {
            if (prevYear()) {
                newElement = $(ELEM_NAME_SELECT_MONTH + ' > option').last();
            } else {
                return false;
            }
        }
        $(ELEM_NAME_SELECT_MONTH).val(newElement.val());
        const year = $(ELEM_NAME_SELECT_YEAR + ' > option:selected').val();
        initDayOptions(year, newElement.val());
        return true;
    }

    function nextMonth() {
        var currentElement = $(ELEM_NAME_SELECT_MONTH + ' > option:selected');
        var newElement = currentElement.next('option');
        if (newElement.length === 0) {
            if (nextYear()) {
                newElement = $(ELEM_NAME_SELECT_MONTH + ' > option').first();
            } else {
                return false;
            }
        }
        $(ELEM_NAME_SELECT_MONTH).val(newElement.val());
        const year = $(ELEM_NAME_SELECT_YEAR + ' > option:selected').val();
        initDayOptions(year, newElement.val());
        return true;
    }

    function prevYear() {
        var currentElement = $(ELEM_NAME_SELECT_YEAR + ' > option:selected');
        var newElement = currentElement.prev('option');
        if (newElement.length === 0) {
            return false;
        }
        $(ELEM_NAME_SELECT_YEAR).val(newElement.val());
        return true;
    }

    function nextYear() {
        var currentElement = $(ELEM_NAME_SELECT_YEAR + ' > option:selected');
        var newElement = currentElement.next('option');
        if (newElement.length === 0) {
            return false;
        }
        $(ELEM_NAME_SELECT_YEAR).val(newElement.val());
        return true;
    }

    function initYearOptions() {
        const thisYear = (new Date()).getFullYear();
        for (var i = START_YEAR; i <= thisYear; i++) {
            $(ELEM_NAME_SELECT_YEAR).append('<option value="' + i + '">' + i + '</option>');
        }
    }

    function initDayOptions(year, month) {
        var lastDay = new Array('', 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            lastDay[2] = 29;
        }

        var prevDay = null;
        if ($(ELEM_NAME_SELECT_DAY + ' > option').length > 0) {
            prevDay = $(ELEM_NAME_SELECT_DAY + ' > option:selected').val();
            $(ELEM_NAME_SELECT_DAY).empty();
        }

        for (var i = 1; i <= lastDay[month]; i++) {
            $(ELEM_NAME_SELECT_DAY).append('<option value="' + i + '">' + i + '</option>');
        }

        if (prevDay !== null) {
            if (prevDay > lastDay[month]) {
                prevDay = lastDay[month];
            }
            $(ELEM_NAME_SELECT_DAY).val(prevDay);
        }
    }

    function initDateSelect() {
        var now = new Date();
        var hour_delta = now.getHours() % 3;
        // if (hour_delta === 2) {
        //     hour_delta = 1;
        // } else if (hour_delta === 1) {
        //     hour_delta = 2;
        // } else {
        //     hour_delta = 0;
        // }
        now.setHours(now.getHours() - hour_delta);
        // console.log(hour_delta)
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hour = now.getHours();
        $(ELEM_NAME_SELECT_YEAR).val(year);
        $(ELEM_NAME_SELECT_MONTH).val(month);
        $(ELEM_NAME_SELECT_DAY).val(day);
        $(ELEM_NAME_SELECT_HOUR).val(hour);
    }

    function resetWindyImage() {
        if ($(ELEM_NAME_WINDY_IMAGE + '> div').length > 1) {
            return;
        }

        const area = $(ELEM_NAME_INPUT_AREA + ':checked').val();
        const type = $(ELEM_NAME_INPUT_TYPE + ':checked').val();
        const year = $(ELEM_NAME_SELECT_YEAR).val();
        const month = toDoubleDigits($(ELEM_NAME_SELECT_MONTH).val());
        const day = toDoubleDigits($(ELEM_NAME_SELECT_DAY).val());
        const hour = toDoubleDigits($(ELEM_NAME_SELECT_HOUR).val());
        const delay = autoPlayStatus === AUTO_PLAY_STATUS.STOP ? ANIMATION_DURATION_MANUAL : ANIMATION_DURATION_AUTO;

        var path = 'images/windy/' + type + '/' + area + '/' + year + '/' + toDoubleDigits(month) + '/' + toDoubleDigits(day) + '/' +
            'windy_' + type + '_' + area + '_' + year + toDoubleDigits(month) + toDoubleDigits(day) + toDoubleDigits(hour) + '.png';
        console.log(path)

        $(ELEM_NAME_WINDY_IMAGE).append('<div></div>');
        $(ELEM_NAME_WINDY_IMAGE + '> div').last().css('animation-duration', delay + 'ms');
        $(ELEM_NAME_WINDY_IMAGE + '> div').last().css('background-image', 'url(' + path + ')');
        $(ELEM_NAME_WINDY_IMAGE + '> div').first().delay(delay).queue(function() {
            $(this).remove();
        })
    }

    function autoPlay() {
        const interval = $(ELEM_NAME_SELECT_SPEED + ' > option:selected').val();
        autoPlayTimer = setTimeout(function() {
            autoPlayStatus === AUTO_PLAY_STATUS.PLAY ? nextHour() : prevHour();
            autoPlay();
        }, interval);
    }

    function startAutoPlay(status) {
        clearTimeout(autoPlayTimer);
        autoPlay();
        switch (status) {
            case AUTO_PLAY_STATUS.PLAY:
                autoPlayStatus = status;
                $(ELEM_NAME_PREV_BUTTON).removeClass(CLASS_NAME_PAUSE);
                $(ELEM_NAME_PREV_BUTTON).addClass(CLASS_NAME_PLAY);
                $(ELEM_NAME_NEXT_BUTTON).removeClass(CLASS_NAME_PLAY);
                $(ELEM_NAME_NEXT_BUTTON).addClass(CLASS_NAME_PAUSE);
                break;
            case AUTO_PLAY_STATUS.REVERSE:
                autoPlayStatus = status;
                $(ELEM_NAME_PREV_BUTTON).removeClass(CLASS_NAME_PLAY);
                $(ELEM_NAME_PREV_BUTTON).addClass(CLASS_NAME_PAUSE);
                $(ELEM_NAME_NEXT_BUTTON).removeClass(CLASS_NAME_PAUSE);
                $(ELEM_NAME_NEXT_BUTTON).addClass(CLASS_NAME_PLAY);
                break;
            case AUTO_PLAY_STATUS.STOP:
                console.warn('status=' + status);
                stopAutoPlay();
                break;
            default:
                break;
        }
    }

    function stopAutoPlay() {
        autoPlayStatus = AUTO_PLAY_STATUS.STOP;
        clearTimeout(autoPlayTimer);
        $(ELEM_NAME_PREV_BUTTON).removeClass(CLASS_NAME_PAUSE);
        $(ELEM_NAME_PREV_BUTTON).addClass(CLASS_NAME_PLAY);
        $(ELEM_NAME_NEXT_BUTTON).removeClass(CLASS_NAME_PAUSE);
        $(ELEM_NAME_NEXT_BUTTON).addClass(CLASS_NAME_PLAY);
    }

    function toDoubleDigits(n) {
        n += '';
        if (n.length === 1) {
            n = "0" + n;
        }
        return n;
    }

});