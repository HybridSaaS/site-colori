/// <reference path="../definition/jquery.d.ts" />
var WebPage;
(function (WebPage) {
    (function (References) {
        (function (MessageBox) {
            MessageBox.$messageLayer;
            MessageBox.$message;

            MessageBox.$messageHeader;
            MessageBox.$messageBody;
        })(References.MessageBox || (References.MessageBox = {}));
        var MessageBox = References.MessageBox;

        References.$document;
        References.$html;
        References.$body;
    })(WebPage.References || (WebPage.References = {}));
    var References = WebPage.References;

    (function (Data) {
        Data.language;
        Data.country;
        Data.productGuid;
        Data.basketGuid;
    })(WebPage.Data || (WebPage.Data = {}));
    var Data = WebPage.Data;

    var Event = (function () {
        function Event(eventType, data) {
            this.eventType = eventType;
            this.data = data;
        }
        return Event;
    })();
    WebPage.Event = Event;

    (function (EventType) {
        EventType[EventType["BeforeLoad"] = 0] = "BeforeLoad";
        EventType[EventType["Load"] = 1] = "Load";
    })(WebPage.EventType || (WebPage.EventType = {}));
    var EventType = WebPage.EventType;
    (function (Events) {
        (function (Handlers) {
            Handlers.onBeforeLoad = [];
            Handlers.onLoad = [];
        })(Events.Handlers || (Events.Handlers = {}));
        var Handlers = Events.Handlers;

        function fire(eventType, data) {
            if (typeof data === "undefined") { data = null; }
            var handlers = getHandlers(eventType);
            for (var x = 0; x < handlers.length; x++) {
                handlers[x].call(new Event(eventType, data));
            }
        }
        Events.fire = fire;

        function getHandlers(eventType) {
            switch (eventType) {
                case 1 /* Load */:
                    return Handlers.onLoad;
                case 0 /* BeforeLoad */:
                    return Handlers.onBeforeLoad;
            }
            return null;
        }

        function on(eventType, handler) {
            getHandlers(eventType).push(handler);
        }
        Events.on = on;
    })(WebPage.Events || (WebPage.Events = {}));
    var Events = WebPage.Events;

    //wil be overridden
    function resourceString(name) {
        return 'no translation: ' + name;
    }
    WebPage.resourceString = resourceString;

    //init the page (onload)
    function load() {
        Events.fire(0 /* BeforeLoad */);

        References.$document = $(document);
        References.$html = $('html');
        References.$body = $(document.body);

        //set language
        Data.language = References.$html.attr('lang');
        Data.country = References.$html.data('country');

        //init basket
        Basket.init();

        //verplichte velden
        $('.required').change(function (event) {
            var $this = $(event.target);

            if ($this.val().length) {
                $this.addClass('ok');
            } else {
                $this.removeClass('ok');
            }
        });

        Events.fire(1 /* Load */);
    }
    WebPage.load = load;

    (function (Basket) {
        (function (References) {
            References.$basket;
            References.$amount;
            References.$total;
        })(Basket.References || (Basket.References = {}));
        var References = Basket.References;

        (function (Events) {
            Events.onChange;
        })(Basket.Events || (Basket.Events = {}));
        var Events = Basket.Events;

        function init() {
            References.$basket = $('#shoppingCart');
            References.$amount = $('#shoppingcart_amount');
            References.$total = $('#shoppingcart_total');

            updateClient(true);
        }
        Basket.init = init;

        function updateClient(init) {
            var _this = this;
            if (typeof init === "undefined") { init = false; }
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: '/Website/Basket/Update-client',
                cache: false
            }).done(function (data) {
                if (Events.onChange) {
                    var result = Events.onChange.call(_this, data);
                    if (result === false)
                        return;
                }

                References.$total.text(data.total);
                References.$amount.text(data.count);

                if (!init) {
                    $('.basket-total').text(data.total);
                    $('.basket-total-incl').text(data.totalIncl);
                    $('.basket-total-excl').text(data.totalExcl);
                }
            });
        }
        Basket.updateClient = updateClient;

        function updateAmount(id, amount, callBack) {
            var _this = this;
            if (typeof callBack === "undefined") { callBack = null; }
            var data = {};
            data["property"] = 'amount';
            data["id"] = id;
            data["amount"] = amount;

            $.ajax({
                type: 'POST',
                data: data,
                dataType: 'json',
                url: '/Website/Basket/Update',
                cache: false
            }).done(function (result) {
                if (callBack != null) {
                    callBack.call(_this, result);
                }

                updateClient();
            });
        }
        Basket.updateAmount = updateAmount;

        function remove(id) {
            var data = {};
            data["property"] = 'remove';
            data["id"] = id;

            $.ajax({
                type: 'POST',
                data: data,
                dataType: 'text',
                url: '/Website/Basket/Update',
                cache: false
            }).done(function () {
                return updateClient();
            });
        }
        Basket.remove = remove;
    })(WebPage.Basket || (WebPage.Basket = {}));
    var Basket = WebPage.Basket;

    (function (Message) {
        (function (MessageType) {
            MessageType[MessageType["Information"] = 0] = "Information";
            MessageType[MessageType["Warning"] = 1] = "Warning";
            MessageType[MessageType["Success"] = 2] = "Success";
            MessageType[MessageType["Error"] = 3] = "Error";
        })(Message.MessageType || (Message.MessageType = {}));
        var MessageType = Message.MessageType;

        var Settings = (function () {
            function Settings() {
                this.type = 0 /* Information */;
            }
            return Settings;
        })();
        Message.Settings = Settings;

        function show(messagesettings, callbackFunction) {
            if (typeof callbackFunction === "undefined") { callbackFunction = null; }
            if (!References.MessageBox.$messageLayer) {
                References.MessageBox.$messageLayer = $('<div id="message-container"><div class="message">' + '<div class="message-header"></div>' + '<div class="message-body"></div>' + '</div></div>');

                References.MessageBox.$messageLayer.appendTo(References.$body);
                References.MessageBox.$message = References.MessageBox.$messageLayer.find('.message');
                References.MessageBox.$messageHeader = References.MessageBox.$message.find('.message-header');
                References.MessageBox.$messageBody = References.MessageBox.$message.find('.message-body');

                References.MessageBox.$messageLayer.bind('click', function () {
                    References.MessageBox.$message.animate({ 'top': '150%' }, 200, function () {
                        References.MessageBox.$messageLayer.fadeOut(200);

                        if (callbackFunction != null) {
                            callbackFunction.call(this);
                        }
                    });
                });
            }

            References.MessageBox.$messageLayer.focus();
            setTimeout(function () {
                References.MessageBox.$messageLayer.trigger('click');
            }, 2500);

            References.MessageBox.$messageHeader.text(messagesettings.header);
            References.MessageBox.$messageBody.text(messagesettings.body);
            References.MessageBox.$message.removeClass();
            switch (messagesettings.type) {
                case 3 /* Error */:
                    References.MessageBox.$message.addClass('message error');
                    break;
                case 2 /* Success */:
                    References.MessageBox.$message.addClass('message success');
                    break;
                case 1 /* Warning */:
                    References.MessageBox.$message.addClass('message erwarningror');
                    break;
                default:
                    References.MessageBox.$message.addClass('message info');
                    break;
            }

            References.MessageBox.$messageLayer.fadeIn(200);
            var $window = $(window);
            var top = Math.abs((($window.height() - References.MessageBox.$message.outerHeight()) / 2));

            //top = $window.scrollTop();
            References.MessageBox.$message.css('top', 0).animate({ 'top': top }, 200);
        }
        Message.show = show;
    })(WebPage.Message || (WebPage.Message = {}));
    var Message = WebPage.Message;
})(WebPage || (WebPage = {}));

//Load website
$(function () {
    return WebPage.load();
});

$(function () {
    //onload
    var $menuItems = $('.main-column-left nav>ul>li>span');
    $menuItems.click(function (event) {
        $(event.delegateTarget).parent().toggleClass('show-menu');
    });
    $menuItems.each(function (index, elem) {
        if ($(elem).find('.hybridsaas-menu-current').length != 0) {
            $(elem).addClass('show-menu');
        }
    });

    var $products = $('.container > .product');
    var buyButton = $(document.createElement('div'));
    $products.each(function (index, elem) {
        $('<input/>', {
            'type': 'button',
            'value': 'Add to basket',
            'class': 'buyButton',
            'click': function () {
                $.getJSON('/Website/Basket/Add', { 'product': $(elem).data('productId'), 'amount': 1 }).done(function () {
                    return WebPage.Basket.updateClient();
                });
                return false;
            }
        }).appendTo($(elem).children('.price'));
    });

    var $imageFrame = $('.product-left .product-image .imageFrame');
    var $zoomImage = $($imageFrame).children('img');
    var link = $zoomImage.data('guid');
    $imageFrame.addClass('easyzoom');
    $zoomImage.detach();
    $imageFrame.append('<a href="' + '/image/product/guid/' + link + '?width=750&height=750"></div>');
    $imageFrame.children('a').append($zoomImage);

    $easyzoom = $('.easyzoom').easyZoom();

    var $products = $('.product .price span');

    for (var x = 0; x < $products.length; x++) {
        var $product = $products.eq(x);
        var price = $product.text();
        var decimals = price.substring(price.length - 2, price.length);
        if (decimals = '00') {
            price = price.substring(0, price.length - 3);
            $product.html(price);
        }
    }

    var $sizes = $('.related-container .related.open .imageFrame .size');

    if (WebPage.Data.productGuid) {
        $('#submit').click(function (event) {
            event.preventDefault();
            var data = {
                basketId: WebPage.Data.basketGuid,
                product: WebPage.Data.productGuid,
                remark: $('#remark').val(),
                amount: 1
            };

            var $extension = $('.extension');
            if ($extension.length > 0) {
                var $set = null;
                for (var x = 0; x < $extension.length; x++) {
                    var $element = $extension.eq(x);
                    if ($element.attr('id') != 'remark') {
                        if ($element.hasClass('inputrequired')) {
                            if ($element.val().length == 0) {
                                if (!$set) {
                                    $set = $element;
                                }
                                $element.addClass('missing');
                            } else {
                                $element.removeClass('missing');
                            }
                        }

                        data["extension:" + $element.attr('id')] = $element.val();
                    }
                }
            }
            if ($set) {
                //not complete, abort
                var msg = new WebPage.Message.Settings();
                msg.type = WebPage.Message.MessageType.Error;
                msg.body = WebPage.resourceString('BasketNotAllRequiredFieldsFilled');
                msg.header = WebPage.resourceString('Basket');
                WebPage.Message.show(msg, function () {
                    $set.focus();
                });

                return;
            }

            $.ajax({
                type: 'POST',
                url: '/Website/Basket/Add',
                cache: false,
                data: data
            }).done(function () {
                WebPage.Basket.updateClient();
                location.href = "/Website/Pages/Basket";
            }).fail(function () {
                msg = new WebPage.Message.Settings();
                msg.type = WebPage.Message.MessageType.Error;
                msg.body = WebPage.resourceString('BasketAddError');
                msg.header = WebPage.resourceString('Basket');

                WebPage.Message.show(msg);
            }).always(function () {
            });
        });
    }
    ;
});
