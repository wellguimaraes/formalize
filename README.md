# Formalize.js
A form-to-object and object-to-form conversion library.

#### Fill in a form with an object

```html
<!-- The form -->
<form id="my-form">
    <input type="text" name="customer.name">
    <input type="text" name="customer.pets[0].name">
    <select type="text" name="customer.pets[0].type">
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
    </select>
</form>
```

```js
// The object
var obj = {
    customer: {
        name: "John Doe",
        pets: [
            {name: "Rex", type: "cat"},
            {name: "Fluffy", type: "dog"}
        ]
    }
};

// Fill it in
Formalize.objectToForm(obj, '#my-form');
```

**Formalize** created two hidden fields (for the form missing fields):

```html
<input type="text" name="customer.pets[1].name">
<input type="text" name="customer.pets[1].type">
```

#### Get and object based on a form

```js
var obj = Formalize.formToObject('#my-form');
```
