/* eslint-disable no-undef */
// Initiate the carousel with the options
$(document).ready(function () {
  $('.jsFilter').on('click', function () {
    $('.filter-menu').toggleClass('active')
  })

  $('.grid').on('click', function () {
    $('.list').removeClass('active')
    $('.grid').addClass('active')
    $('.products-area-wrapper').addClass('gridView').removeClass('tableView')
  })

  $('.list').on('click', function () {
    $('.list').addClass('active')
    $('.grid').removeClass('active')
    $('.products-area-wrapper').removeClass('gridView').addClass('tableView')
  })

  var modeSwitch = $('.mode-switch')
  modeSwitch.on('click', function () {
    $('html').toggleClass('light')
    modeSwitch.toggleClass('active')
  })
})
