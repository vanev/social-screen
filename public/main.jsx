var socket = io();

var Images = React.createClass({
    MAX_COUNT: 8,

    getInitialState: function () {
        while (this.props.images.length > this.MAX_COUNT) { this.props.images.shift(); }
        return { images: this.props.images };
    },

    componentDidMount: function () {
        socket.on('new_images', function (images_data) {
            var images = _.reduce(images_data, function (memo,image_data) {
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

var Subscription = React.createClass({
    handleClick: function (e) {
        e.preventDefault();
        this.props.onRemove(this.props.id);
    },
    render: function () {
        return (
            <div className="subscription">
                <span className="kind">{this.props.kind}</span>
                <span className="label">{this.props.label}</span>
                <button onClick={this.handleClick}>Remove</button>
            </div>
        );
    }
});

var SubscriptionInput = React.createClass({
    handleClick: function (e) {
        e.preventDefault();
        var label = this.refs.label.getDOMNode().value.trim();
        var kind = this.refs.kind.getDOMNode().value.trim();

        this.props.onAdd(kind, label);

        this.refs.label.getDOMNode().value = '';
    },
    render: function () {
        return (
            <div className="subscription-input">
                <select ref="kind" disabled>
                    <option>tag</option>
                </select>
                <input type="text" ref="label" />
                <button onClick={this.handleClick}>Add</button>
            </div>
        )
    }
});

var Manager = React.createClass({
    handleRemove: function (id) {
        $.ajax({
            url: '/subscriptions/remove/'+id,
            dataType: 'json',
            type: 'POST',
            success: function (res) {
                var subs = _.reject(this.state.subscriptions, function (sub) {
                    return sub.id === id;
                });
                this.setState({ subscriptions: subs });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(id, status, err.toString());
            }.bind(this)
        });
    },
    handleSubscriptionAdd: function (kind,label) {
        $.ajax({
            url: '/subscriptions/add/'+kind+'/'+label,
            dataType: 'json',
            type: 'POST',
            success: function (res) {
                var subs = this.state.subscriptions;
                var new_subs = subs.concat([res]);
                this.setState({ subscriptions: new_subs });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(id, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function () {
        return { subscriptions: this.props.subscriptions };
    },
    render: function () {
        var subNodes = this.state.subscriptions.map(function (data) {
            return (
                <Subscription id={data.id} kind={data.object} label={data.object_id} onRemove={this.handleRemove} />
            );
        }.bind(this));
        return (
            <div className="subscriptions">
                {subNodes}
                <SubscriptionInput onAdd={this.handleSubscriptionAdd} />
            </div>
        );
    }
});
