var socket = io();

var Images = React.createClass({
    MAX_COUNT: 8,

    getInitialState: function () {
        return { images: this.props.images };
    },

    componentDidMount: function () {
        socket.on('new_images', function (images_data) {
            var images = _.reduce(images_data, function (memo,image_data) {
                console.log(memo);
                if (!_.contains(memo, image_data)) memo.push(image_data);
                while (memo.length > this.MAX_COUNT) { memo.shift(); }
                return memo;
            }.bind(this), this.state.images);

            this.setState({ images: images });
        }.bind(this));
    },

    render: function () {
        var imageNodes = this.state.images.map(function (data) {
            return (
                <div className="image">
                    <img src={data.images.standard_resolution.url} />
                    <p>{data.user.full_name}</p>
                </div>
            );
        });
        return (
            <div className="images">
                {imageNodes}
            </div>
        );
    }
});
