var Events  = require('events');


function debug() {
}


module.exports = class Animation extends Events {

    constructor(options) {
        super();

        var {name = 'Noname', priority = 'normal', duration = undefined} = options;

        this.name            = name;
        this.priority        = priority;
        this.cancelled       = false;
        this.duration        = duration;
        this.renderFrequency = 0;
        this.renderTime      = 0;


        if (typeof options.debug === 'function') {
            debug = options.debug;
        }
        else if (options.debug) {
            debug = console.log;
        }


    }

    render() {
    }

    start() {
        debug('Starting animation', this.name);

        return new Promise((resolve, reject) => {

            this.cancelled  = false;
            this.renderTime = 0;

            debug('Animation', this.name, 'started.');
            resolve();

            this.emit('started');

        });

    }

    stop() {
        debug('Stopping animation', this.name);

        return new Promise((resolve, reject) => {

            debug('Animation', this.name, 'stopped.');
            resolve();

            this.emit('stopped');
        });
    }


    loop() {
        var self = this;

        debug('Running loop', self.name);

        return new Promise((resolve, reject) => {

            var start = new Date();

            function loop() {

                var now = new Date();

                if (self.cancelled) {
                    resolve();
                }
                else if (self.duration != undefined && (self.duration >= 0 && now - start > self.duration)) {
                    resolve();
                }
                else {
                    var now = new Date();

                    if (self.renderFrequency == 0 || now - self.renderTime >= self.renderFrequency) {

                        self.render();
                        self.renderTime = now;
                    }

                    setImmediate(loop);
                }
            }

            loop();
        });
    }



    cancel() {
        debug('Cancelling animation', this.name);
        this.cancelled = true;
    }

    run(options) {

        if (options) {
            var {priority = this.priority, duration = this.duration} = options;

            this.priority  = priority;
            this.duration  = duration;
    
        }

        return new Promise((resolve, reject) => {

            this.start().then(() => {
                return this.loop();
            })
            .then(() => {
                return this.stop();
            })
            .catch((error) => {
                console.log(error);
            })
            .then(() => {
                resolve();
            });

        });

    }
}
