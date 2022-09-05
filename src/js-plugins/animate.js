const $element = $('[data-animation]'),
      data = $element.data(),
      animation = data.animation,
      delay = data.animationDelay || null,
      duration = data.animationDuration || null;

$element
  .css({
    animationDelay: delay ? `${delay}ms` : '',
    animationDuration: duration ? `${duration}ms` : ''
  })
  .addClass(`animated ${animation}`);