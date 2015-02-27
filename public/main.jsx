var socket = io();

var Images = React.createClass({
    getInitialState: function () {
        return { images: this.props.images };
    },

    componentDidMount: function () {
        socket.on('new_images', function (images_data) {
            this.setState({ images: images_data });
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
