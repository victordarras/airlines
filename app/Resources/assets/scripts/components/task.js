(function () {
    'use strict';

    var React = require('react/addons'),
        reqwest = require('reqwest'),
        DragDropMixin = require('react-dnd').DragDropMixin,
        ItemTypes = require('../imports/itemTypes'),
        DateHelper = require('../imports/dateHelper'),
        Numbers = require('./numbers'),
        Editable = require('./editable');

    module.exports = React.createClass({
        mixins: [
            DragDropMixin
        ],



        /**
         * Removes this Task from the database and triggers reloading for the member and day it belongs to
         *
         * @return void
         */
        remove: function() {
            if (!confirm('Are you sure ?')) {
                return;
            }

            reqwest({
                url: this.props.restUrl,
                type: 'json',
                method: 'DELETE',

                error: function(err) {
                    // TODO: error handling, if there's any need
                },

                success: function(response) {
                    this.props.handleUpdate();
                }.bind(this)
            });
        },



        /**
         * Splits this Task in two and triggers reloading for the member and day it belongs to
         *
         * @return void
         */
        split: function() {
            reqwest({
                url: this.props.splitUrl,
                type: 'json',
                method: 'POST',

                error: function(err) {
                    // TODO: error handling, if there's any need
                },

                success: function(response) {
                    this.props.handleUpdate();
                }.bind(this)
            });
        },



        /**
         * Updates this Task's fields
         *
         * @param object   data     Key-value pairs
         * @param function callback AJAX success callback
         *
         * @return void
         */
        update: function(data, callback) {
            reqwest({
                url: this.props.restUrl,
                type: 'json',
                method: 'PUT',
                data: data,

                error: function(err) {
                    // TODO: error handling, if there's any need
                },

                success: function() {
                    ('function' === typeof callback) && callback();
                    this.props.handleUpdate();
                }.bind(this)
            });
        },



        /**
         * Moves this Task to the given member and date
         *
         * @param int      member   Member id
         * @param string   date     New date
         * @param function callback AJAX success callback
         *
         * @return void
         */
        move: function(member, date, callback) {
            var dateHelper = new DateHelper();

            if (!dateHelper.compare(this.props.date, date) || (this.props.member != member)) {
                this.update({ member: member, date: date }, callback);
            }
        },



        /**
         * Merges a Task into this one
         *
         * @param int task Task id
         *
         * @return void
         */
        merge: function(task) {
            reqwest({
                url: this.props.mergeUrl + task,
                type: 'json',
                method: 'POST',

                error: function(err) {
                    // TODO: error handling, if there's any need
                },

                success: function(response) {
                    this.props.handleUpdate();
                }.bind(this)
            });
        },



        /**
         * Drag'n'drop mixin configuration callback
         *
         * @param function registerType Item type registration closure
         *
         * @return void
         */
        configureDragDrop: function(registerType) {
            var dateHelper = new DateHelper();

            registerType(
                ItemTypes.TASK,
                {
                    dragSource: {
                        beginDrag: function() {
                            return {
                                item: this
                            };
                        }
                    },

                    dropTarget: {
                        acceptDrop: function(task) {
                            this.merge(task.props.id);
                        }
                    }

                }
            );
        },



        /**
         * Rendering React hook
         * Passes props through to the Numbers and attaches action handlers
         *
         * @return void
         */
        render: function() {
            var style = {},
                nameStyle = { backgroundColor: this.props.color },

                classes = React.addons.classSet({
                    'task': true,
                    'task--dragged': this.getDragState(ItemTypes.TASK).isDragging,
                    'task--hovered': this.getDropState(ItemTypes.TASK).isHovering
                }),

                handleNameInput = function(name) {
                    this.update({ name : name });
                }.bind(this);

            return (
                <div className={classes} style={style} {...this.dragSourceFor(ItemTypes.TASK)} {...this.dropTargetFor(ItemTypes.TASK)}>
                    <div className="task__name" style={nameStyle}>
                        <Editable handleInput={handleNameInput}>{this.props.name}</Editable>
                    </div>
                    <Numbers estimate={this.props.estimate} consumed={this.props.consumed} remaining={this.props.remaining} handleInput={this.update} />
                    <div className="task__action-group">
                        <a className="task__action task__action--split" title="Split" onClick={this.split}></a>
                        <a className="task__action task__action--remove" title="Delete" onClick={this.remove}></a>
                    </div>
                </div>
            );
        }
    });
})();
