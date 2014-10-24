var game = new Phaser.Game(600, 600, Phaser.AUTO, 'body');
playState = {
    init: function() {
    //Called as soon as we enter this state
        console.log('state init');
    },

    preload: function() {
        console.log('state preload');
        game.load.spritesheet('character', 'assets/character.png');
    //Assets to be loaded before create() is called
    },

    create: function() {
        console.log('state create');
        this.game.stage.backgroundColor = '#dfdfdf';
        this.player = game.add.sprite(20, 20, 'character');
        this.player.angle = 45;
        this.player.anchor.setTo(0.5, 0.5);
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.playerSpeed = 400;
        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.A,
            Phaser.Keyboard.D,
            Phaser.Keyboard.W,
            Phaser.Keyboard.S
        ]);
    },

    update: function() {
        if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.velocity.x = -this.playerSpeed;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.velocity.x = this.playerSpeed;
        } else {
            this.player.body.velocity.x = 0;
        }
        if (this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.player.body.velocity.y = -this.playerSpeed;
        } else if (this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.body.velocity.y = this.playerSpeed;
        } else {
            this.player.body.velocity.y = 0;
        }
        this.player.angle = -90 + this.game.math.angleBetween( this.game.input.x, this.game.input.y, this.player.body.x, this.player.body.y) * (180/Math.PI);
        console.log(this.player.angle);
    }
};

game.state.add('play', playState);
game.state.start('play');

console.log('Current state: ' + game.state.getCurrentState());