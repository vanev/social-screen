$(document).ready(init);

function init () {
    var socket = io(),
        images = [],
        $images = $('[data-images]');

    socket.on('new_images', function (images_data) {
        _.each(images_data, function (image_data) {
            var image = _.findWhere(images, { id: image_data.id });
            if (!image) {
                $images.append('<img src="'+image_data.images.thumbnail.url+'" />');
                images.push(image_data);
            }
        });
        console.log(images_data);
    });
}
