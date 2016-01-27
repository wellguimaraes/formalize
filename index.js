var Formalize = function () {

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

        var rootIsArray = Object.prototype.toString.call(obj) === "[object Array]";
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

            var pathKeys = fields[f].path.split('.');
            var curr = obj;

            for (var k = 0; k < pathKeys.length; k++) {

                var pathKey = pathKeys[k].replace(/\[\d+\]/, '');
                var arrayIndex = /\[\d+\]/.test(pathKeys[k])
                    ? /\[(\d+)\]/.exec(pathKeys[k])[1]
                    : -1;

                var latestPathKey = k === pathKeys.length - 1;
                var itemIsNotDefined = curr[pathKey] === undefined;
                var isArrayItem = arrayIndex > -1;

                if (itemIsNotDefined && !latestPathKey) {
                    if (!isArrayItem)
                        curr[pathKey] = {};
                    else {
                        curr[pathKey] = [];
                        curr[pathKey][arrayIndex] = {};
                    }
                } else if (latestPathKey) {
                    if (curr[pathKey] instanceof Array)
                        curr[pathKey].push(fields[f].value);
                    else
                        curr[pathKey] = fields[f].value;
                } else if (isArrayItem && curr[pathKey][arrayIndex] === undefined) {
                    curr[pathKey][arrayIndex] = {};
                }

                curr = (curr[pathKey] instanceof Array)
                    ? curr[pathKey][arrayIndex]
                    : curr[pathKey];
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

        for (var i = 0; i < fields.length; i++) {
            var field = formObj.querySelector("[name='" + fields[i].path + "']");

            if (field != null) {
                var type = field.dataset.type || "text";

                switch (type.toLowerCase()) {
                    case "date":
                        field.value = new Date(fields[i].value).toLocaleString().substr(0, 10);
                        break;
                    default:
                        field.value = fields[i].value;
                }
            } else {
                var hidden = document.createElement("input");

                hidden.type = "hidden";
                hidden.name = fields[i].path;
                hidden.value = fields[i].value;

                formObj.appendChild(hidden);
            }
        }
    };


    /**
     *
     * @param formSelector
     * @param includeEmpty
     * @returns {*}
     */
    this.formToObject = function (formSelector, includeEmpty) {
        var form     = document.querySelector(formSelector) || document.forms[0];
        var elements = form.elements;
        var fields   = [];

        for (var i in elements) {
            var element = elements[i];
            var type    = element.type;
            var name    = element.name;
            var value   = element.value;

            if (name === '') continue;

            switch (type) {
                case 'text':
                case 'radio':
                case 'checkbox':
                case 'textarea':
                case 'select-one':
                case 'password':
                case 'hidden':
                    if (value === '' && !includeEmpty)
                        continue;

                    if (element.dataset.type === 'bool')
                        value = (value === 'true');

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

