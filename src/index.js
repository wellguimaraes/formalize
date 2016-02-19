var Formalize = function () {

    var _isArray = function (obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };

    /**
     * Recursively find fields in an object
     *
     * @param obj object
     * @param parentPath
     * @returns *[] an array of fields { path: string, value: any }
     */
    var _mapObjectFields = function (obj, parentPath) {

        var fields = {};

        if (obj == null) return fields;

        var rootIsArray = _isArray(obj);
        var rootIsObject = typeof obj === "object";

        if (rootIsArray || rootIsObject) {
            for (var i in obj) {
                var itemPath = rootIsArray
                    ? parentPath + "[" + i + "]"
                    : parentPath != null
                    ? parentPath + "." + i
                    : i;

                var subFields = _mapObjectFields(obj[i], itemPath);

                for (var subField in subFields)
                    fields[subField] = subFields[subField];
            }

            return fields;
        }

        fields[parentPath] = obj;

        return fields;
    };

    /**
     * Create an object based on form input
     *
     * @param fields an array with the fields names
     * @returns {{}}
     */
    var _createObjectFrom = function (fields) {
        var obj = {};

        for (var f = 0; f < fields.length; f++) {
            var path = fields[f].path.split('.');
            var curr = obj;

            for (var p = 0; p < path.length; p++) {
                var pathItem = path[p].replace(/\[\d+\]/, '');
                var arrayIndex = /\[\d+\]/.test(path[p])
                    ? parseInt(/\[(\d+)\]/.exec(path[p])[1])
                    : -1;

                var endOfPath = p === path.length - 1;
                var itemIsNotDefined = curr[pathItem] === undefined;
                var isArrayItem = arrayIndex > -1;

                if (itemIsNotDefined) {
                    curr[pathItem] = isArrayItem ? [] : {};
                }

                if (endOfPath) {
                    if (isArrayItem)
                        curr[pathItem].push(fields[f].value);
                    else
                        curr[pathItem] = fields[f].value;
                } else if (curr[pathItem] instanceof Array) {
                    if (curr[pathItem][arrayIndex])
                        curr = curr[pathItem][arrayIndex];
                    else
                        curr[pathItem].push(curr = {});

                    continue;
                }

                if (!(curr[pathItem] instanceof Array))
                    curr = curr[pathItem];
            }
        }

        return obj;
    };


    /**
     * Fill in the form field with object values
     *
     * @param obj
     * @param formSelector
     */
    this.objectToForm = function (obj, formSelector) {
        var fields = _mapObjectFields(obj);
        var formObj = document.querySelector(formSelector);

        for (var fieldPath in fields) {
            var field = formObj.querySelector("[name='" + fieldPath + "']");

            if (field == null) {
                field = document.createElement("input");
                field.type = "hidden";
                field.name = fieldPath;
                formObj.appendChild(field);
            }

            field.value = fields[fieldPath];
        }
    };


    /**
     *
     * @param formSelector
     * @param includeEmpty
     * @returns {*}
     */
    this.formToObject = function (formSelector, includeEmpty) {
        var form = document.querySelector(formSelector) || document.forms[0];
        var elements = form.elements;
        var fields = [];

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var type = element.type;
            var name = element.name;
            var value = element.value;

            if (name === '') continue;

            switch (type) {
                case 'text':
                case 'radio':
                case 'checkbox':
                case 'textarea':
                case 'select-one':
                case 'password':
                case 'hidden':
                    if (value === '' && !includeEmpty) continue;
                    fields.push({path: name, value: value});
            }
        }

        return _createObjectFrom(fields);
    };

    return this;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = new Formalize();
else
    window.Formalize = new Formalize();

