# Mini Scrollbar
Simple vanilla javascript library to create a custom scrollbar.

## Browser Support

It was developed for evergreen browsers, but it works both on IE10 and IE11 either.

If you want to make it works down to IE9, the only thing you need to do is to add the [classList polyfill](https://github.com/eligrey/classList.js).

```HTML
<!--[if IE 9]><script src="classList.min.js"></script><![endif]-->
```

## Usage

You can use this library as a script tag, then bind the DIV elements you need.

### Auto-binding
Include the attribute `ms-container` in any `<div>` that you want to make scrollable, and the library will turn it for you

```HTML
<div ms-container>One</div>
<div ms-container>
  <span>Two</span>
</div>
```

### Manual binding
If you want to manually turn your div in a MiniScrollbar, you can use the `MiniScrollbar.initEl` method.

```HTML
<div class="myClass"></div>

<script>
  var el = document.querySelector('.myClass');
  MiniScrollbar.initEl(el);
</script>
```

## Credits
Inspired by TorusHelm's plugin ([Simple Scrollbar](https://github.com/TorusHelm/simple-scrollbar-reworked))
