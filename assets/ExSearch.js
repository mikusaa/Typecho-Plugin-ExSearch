console.log(' %c ExSearch %c https://blog.imalan.cn/archives/261/ ', 'color: #fadfa3; background: #23b7e5; padding:5px;', 'background: #1c2b36; padding:5px;');

(function (window, document) {
    if (window.__ExSearchInitialized) {
        return;
    }
    window.__ExSearchInitialized = true;

    var CONFIG = {
        TRANSLATION: {
            POSTS: '文章',
            PAGES: '页面',
            CATEGORIES: '分类',
            TAGS: '标签',
            UNTITLED: '（未命名）'
        },
        ROOT_URL: (window.ExSearchConfig && window.ExSearchConfig.root) || '',
        CONTENT_URL: (window.ExSearchConfig && window.ExSearchConfig.api) || ''
    };

    var main = document.querySelector('.ins-search');
    if (!main) {
        main = document.createElement('div');
        main.className = 'ins-search';
        main.innerHTML = '' +
            '<div class="ins-search-overlay"></div>' +
            '<div class="ins-search-container">' +
                '<div class="ins-search-container-wrapper">' +
                    '<div class="ins-input-wrapper">' +
                        '<input type="text" class="ins-search-input" placeholder="搜索点什么吧..." />' +
                        '<span class="ins-close ins-selectable"><i class="iconfont icon-close"></i></span>' +
                    '</div>' +
                    '<div class="ins-section-wrapper">' +
                        '<div class="ins-section-container"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(main);
    }

    var input = main.querySelector('.ins-search-input');
    var wrapper = main.querySelector('.ins-section-wrapper');
    var container = main.querySelector('.ins-section-container');

    if (!input || !wrapper || !container) {
        return;
    }

    var searchJSON = {
        posts: [],
        pages: []
    };

    var ModalHelper = {
        scrollTop: 0,
        beforeModal: function () {
            var scrollingElement = document.scrollingElement || document.documentElement;
            ModalHelper.scrollTop = scrollingElement ? scrollingElement.scrollTop : 0;
            document.body.classList.add('es-modal-open');
            document.body.style.top = -ModalHelper.scrollTop + 'px';
        },
        closeModal: function () {
            var scrollingElement = document.scrollingElement || document.documentElement;
            document.body.classList.remove('es-modal-open');
            document.body.style.top = '';
            if (scrollingElement) {
                scrollingElement.scrollTop = ModalHelper.scrollTop;
            }
        }
    };

    function createCompatItem(element) {
        if (!element) {
            if (window.jQuery) {
                return window.jQuery();
            }
            return {
                length: 0,
                el: null,
                attr: function () {
                    return undefined;
                },
                get: function () {
                    return undefined;
                }
            };
        }

        if (window.jQuery) {
            return window.jQuery(element);
        }

        return {
            0: element,
            length: 1,
            el: element,
            attr: function (name) {
                return element.getAttribute(name);
            },
            get: function (index) {
                return index === 0 ? element : undefined;
            }
        };
    }

    function getClosest(target, selector) {
        var element = target;
        if (!element) {
            return null;
        }
        if (element.nodeType !== 1) {
            element = element.parentElement;
        }
        if (!element || typeof element.closest !== 'function') {
            return null;
        }
        return element.closest(selector);
    }

    function parseKeywords(keywords) {
        return String(keywords || '').split(' ').filter(function (keyword) {
            return !!keyword;
        }).map(function (keyword) {
            return keyword.toUpperCase();
        });
    }

    function section(title) {
        var sectionElem = document.createElement('section');
        sectionElem.className = 'ins-section';

        var header = document.createElement('div');
        header.className = 'ins-section-header';
        header.textContent = title;

        sectionElem.appendChild(header);
        return sectionElem;
    }

    function searchItem(icon, title, slug, preview, url) {
        var item = document.createElement('div');
        item.className = 'ins-selectable ins-search-item';
        item.setAttribute('data-url', url || '');

        var header = document.createElement('div');
        header.className = 'header';

        var iconElem = document.createElement('i');
        iconElem.className = 'iconfont icon-' + icon;
        header.appendChild(iconElem);

        header.appendChild(document.createTextNode(title != null && title !== '' ? title : CONFIG.TRANSLATION.UNTITLED));

        if (slug) {
            var slugElem = document.createElement('span');
            slugElem.className = 'ins-slug';
            slugElem.textContent = slug;
            header.appendChild(slugElem);
        }

        item.appendChild(header);

        if (preview) {
            var previewElem = document.createElement('p');
            previewElem.className = 'ins-search-preview';
            previewElem.innerHTML = preview;
            item.appendChild(previewElem);
        }

        return item;
    }

    function sectionFactory(keywords, type, array) {
        var sectionTitle;
        var searchItems;
        var keywordArray = parseKeywords(keywords);
        var sec;
        var i;

        if (!array || array.length === 0) {
            return null;
        }

        sectionTitle = CONFIG.TRANSLATION[type];

        switch (type) {
        case 'POSTS':
        case 'PAGES':
            searchItems = array.map(function (item) {
                var firstOccur = item.firstOccur > 20 ? item.firstOccur - 20 : 0;
                var preview = '';
                delete item.firstOccur;

                keywordArray.forEach(function (keyword) {
                    var regS = new RegExp(keyword, 'gi');
                    preview = item.text.replace(regS, '<mark class="search-keyword"> ' + keyword + ' </mark>');
                });

                preview = preview ? preview.slice(firstOccur, firstOccur + 80) : item.text.slice(0, 80);
                return searchItem('file', item.title, null, preview, CONFIG.ROOT_URL + item.path);
            });
            break;

        case 'CATEGORIES':
        case 'TAGS':
            searchItems = array.map(function (item) {
                return searchItem(type === 'CATEGORIES' ? 'folder' : 'tag', item.name, item.slug, null, item.permalink);
            });
            break;

        default:
            return null;
        }

        sec = section(sectionTitle);
        for (i = 0; i < searchItems.length; i++) {
            sec.appendChild(searchItems[i]);
        }

        return sec;
    }

    function extractToSet(json, key) {
        var values = {};
        var entries = (json.pages || []).concat(json.posts || []);
        var result = [];
        var i;
        var j;
        var entry;

        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            if (entry[key]) {
                for (j = 0; j < entry[key].length; j++) {
                    values[entry[key][j].name] = entry[key][j];
                }
            }
        }

        for (key in values) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                result.push(values[key]);
            }
        }

        return result;
    }

    function filter(keywords, obj, fields) {
        var keywordArray = parseKeywords(keywords);
        var containKeywords = keywordArray.filter(function (keyword) {
            var containFields = fields.filter(function (field) {
                var firstOccur;
                if (!Object.prototype.hasOwnProperty.call(obj, field)) {
                    return false;
                }

                firstOccur = String(obj[field]).toUpperCase().indexOf(keyword);
                if (firstOccur > -1) {
                    if (field === 'text') {
                        obj.firstOccur = firstOccur;
                    }
                    return true;
                }

                return false;
            });

            return containFields.length > 0;
        });

        return containKeywords.length === keywordArray.length;
    }

    function filterFactory(keywords) {
        return {
            POST: function (obj) {
                return filter(keywords, obj, ['title', 'text']);
            },
            PAGE: function (obj) {
                return filter(keywords, obj, ['title', 'text']);
            },
            CATEGORY: function (obj) {
                return filter(keywords, obj, ['name', 'slug']);
            },
            TAG: function (obj) {
                return filter(keywords, obj, ['name', 'slug']);
            }
        };
    }

    function weight(keywords, obj, fields, weights) {
        var value = 0;
        parseKeywords(keywords).forEach(function (keyword) {
            var pattern = new RegExp(keyword, 'img');
            fields.forEach(function (field, index) {
                var matches;
                if (Object.prototype.hasOwnProperty.call(obj, field)) {
                    matches = String(obj[field]).match(pattern);
                    value += matches ? matches.length * weights[index] : 0;
                }
            });
        });
        return value;
    }

    function weightFactory(keywords) {
        return {
            POST: function (obj) {
                return weight(keywords, obj, ['title', 'text'], [3, 1]);
            },
            PAGE: function (obj) {
                return weight(keywords, obj, ['title', 'text'], [3, 1]);
            },
            CATEGORY: function (obj) {
                return weight(keywords, obj, ['name', 'slug'], [1, 1]);
            },
            TAG: function (obj) {
                return weight(keywords, obj, ['name', 'slug'], [1, 1]);
            }
        };
    }

    function search(json, keywords) {
        var WEIGHTS = weightFactory(keywords);
        var FILTERS = filterFactory(keywords);
        var posts = json.posts || [];
        var pages = json.pages || [];
        var tags = extractToSet(json, 'tags');
        var categories = extractToSet(json, 'categories');

        return {
            posts: posts.filter(FILTERS.POST).sort(function (a, b) {
                return WEIGHTS.POST(b) - WEIGHTS.POST(a);
            }),
            pages: pages.filter(FILTERS.PAGE).sort(function (a, b) {
                return WEIGHTS.PAGE(b) - WEIGHTS.PAGE(a);
            }),
            categories: categories.filter(FILTERS.CATEGORY).sort(function (a, b) {
                return WEIGHTS.CATEGORY(b) - WEIGHTS.CATEGORY(a);
            }),
            tags: tags.filter(FILTERS.TAG).sort(function (a, b) {
                return WEIGHTS.TAG(b) - WEIGHTS.TAG(a);
            })
        };
    }

    function searchResultToDOM(keywords, searchResult) {
        var key;
        var sectionElem;

        container.innerHTML = '';

        for (key in searchResult) {
            if (!Object.prototype.hasOwnProperty.call(searchResult, key)) {
                continue;
            }
            sectionElem = sectionFactory(keywords, key.toUpperCase(), searchResult[key]);
            if (sectionElem) {
                container.appendChild(sectionElem);
            }
        }
    }

    function scrollTo(item) {
        var wrapperHeight;
        var itemTop;
        var itemBottom;

        if (!item) {
            return;
        }

        wrapperHeight = wrapper.clientHeight;
        itemTop = item.offsetTop - wrapper.scrollTop;
        itemBottom = item.offsetTop + item.clientHeight;

        if (itemBottom > wrapperHeight + wrapper.scrollTop) {
            wrapper.scrollTop = itemBottom - wrapperHeight;
        }

        if (itemTop < 0) {
            wrapper.scrollTop = item.offsetTop;
        }
    }

    function selectItemByDiff(value) {
        var items = Array.prototype.slice.call(container.querySelectorAll('.ins-selectable'));
        var prevPosition = -1;
        var i;
        var nextPosition;

        if (!items.length) {
            return;
        }

        for (i = 0; i < items.length; i++) {
            if (items[i].classList.contains('active')) {
                prevPosition = i;
                break;
            }
        }

        nextPosition = (items.length + prevPosition + value) % items.length;

        if (prevPosition > -1) {
            items[prevPosition].classList.remove('active');
        }
        items[nextPosition].classList.add('active');
        scrollTo(items[nextPosition]);
    }

    function gotoLink(item) {
        var url;
        if (!item) {
            return;
        }

        url = item.getAttribute('data-url');
        if (url) {
            window.location.href = url;
        }
    }

    function emitExSearchCall(item, eventType) {
        var compatItem;
        var ctx;

        if (typeof window.ExSearchCall !== 'function') {
            return false;
        }

        compatItem = createCompatItem(item);
        ctx = {
            url: item ? (item.getAttribute('data-url') || '') : '',
            element: item || null,
            eventType: eventType || ''
        };

        window.ExSearchCall(compatItem, ctx);
        return true;
    }

    function performSearch() {
        var keywords = input.value;
        searchResultToDOM(keywords, search(searchJSON, keywords));
    }

    function openSearch() {
        var scrollingElement = document.scrollingElement || document.documentElement;
        main.classList.add('show');
        ModalHelper.beforeModal();
        if (scrollingElement) {
            scrollingElement.scrollTop = 0;
        }
        input.focus();
    }

    function closeSearch() {
        main.classList.remove('show');
        ModalHelper.closeModal();
    }

    function loadJSON() {
        if (!CONFIG.CONTENT_URL) {
            return;
        }

        fetch(CONFIG.CONTENT_URL, { credentials: 'same-origin' })
            .then(function (resp) {
                if (!resp.ok) {
                    throw new Error('ExSearch load failed');
                }
                return resp.json();
            })
            .then(function (json) {
                searchJSON = json || { posts: [], pages: [] };
                if (!searchJSON.posts) {
                    searchJSON.posts = [];
                }
                if (!searchJSON.pages) {
                    searchJSON.pages = [];
                }
                performSearch();

                if (window.location.hash.trim() === '#ins-search') {
                    openSearch();
                }
            })
            .catch(function () {
                searchJSON = { posts: [], pages: [] };
                performSearch();
            });
    }

    input.addEventListener('input', performSearch);

    document.addEventListener('focusin', function (event) {
        var trigger = getClosest(event.target, '.search-form-input');
        if (trigger) {
            openSearch();
        }
    });

    document.addEventListener('click', function (event) {
        var trigger = getClosest(event.target, '.search-form-input');
        var item;
        var closeTarget;

        if (trigger) {
            event.preventDefault();
            openSearch();
            return;
        }

        item = getClosest(event.target, '.ins-search-item');
        if (item && main.contains(item)) {
            if (!emitExSearchCall(item, 'click')) {
                gotoLink(item);
            }
            return;
        }

        closeTarget = getClosest(event.target, '.ins-close, .ins-search-overlay');
        if (closeTarget && main.contains(closeTarget)) {
            closeSearch();
        }
    });

    document.addEventListener('keydown', function (event) {
        var activeItem;
        if (!main.classList.contains('show')) {
            return;
        }

        switch (event.keyCode) {
        case 27:
            closeSearch();
            break;
        case 38:
            event.preventDefault();
            selectItemByDiff(-1);
            break;
        case 40:
            event.preventDefault();
            selectItemByDiff(1);
            break;
        case 13:
            activeItem = container.querySelector('.ins-selectable.active');
            if (activeItem) {
                if (!emitExSearchCall(activeItem, 'enter')) {
                    gotoLink(activeItem);
                }
            }
            break;
        default:
            break;
        }
    });

    loadJSON();
})(window, document);
