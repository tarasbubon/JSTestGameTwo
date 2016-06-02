var player;

var enemyList = {};
var upgradeList = {};
var bulletList = {};


Entity = function(type, id, x, y, width, height, img)
{
	var self = {
		type:type,
		id:id,
		x:x,
		y:y,
		width:width,
		height:height,
		img:img,
	};
	
	self.update = function()
	{
		self.updatePosition();
		self.draw();
	}
	
	self.draw= function()
	{
		ctx.save();
		
		var x = self.x - player.x;
		var y = self.y - player.y;
		
		x += WIDTH / 2;
		y += HEIGHT / 2;
		x -= self.width / 2;
		y -= self.height / 2;
		
		ctx.drawImage(self.img, 0, 0, self.img.width, self.img.height, x, y, self.width, self.height);
		
		ctx.restore();
	}
	
	self.getDistanceBetween = function(entity2)
	{
		var vx = self.x - entity2.x;
		var vy = self.y - entity2.y;
		return Math.sqrt(vx * vx + vy * vy);
	}

	self.testCollision = function(entity2)
	{
		var rect1 = {
			x: self.x - self.width / 2,
			y: self.y - self.height / 2,
			width: self.width,
			height: self.height,
		}
		
		var rect2 = {
			x: entity2.x - entity2.width / 2,
			y: entity2.y - entity2.height / 2,
			width: entity2.width,
			height: entity2.height,
		}
		
		return testCollisionPosition(rect1, rect2);
	}
	
	self.updatePosition = function(){}
	
	return self;
}

Player = function()
{
	var self = Actor('player', 'myId', 50, 40, 50, 70, Img.player, 10, 1);
	
	self.pressingDown = false;
	self.pressingUp = false;
	self.pressingLeft = false;
	self.pressingRight = false;
	
	self.updatePosition = function()
	{
		if(player.pressingRight)
			{
				player.x += 10;
			}
			if(player.pressingLeft)
			{
				player.x -= 10;
			}
			if(player.pressingDown)
			{
				player.y += 10;
			}
			if(player.pressingUp)
			{
				player.y -= 10;
			}
			
			if(player.x < player.width / 2)
			{
				player.x = player.width / 2;
			}
			if(player.x > currentMap.width - player.width / 2)
			{
				player.x = currentMap.width - player.width / 2;
			}
			if(player.y < player.height / 2)
			{
				player.y = player.height / 2;
			}
			if(player.y > currentMap.height - player.height / 2)
			{
				player.y = currentMap.height - player.height / 2;
			}
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		if(self.hp <= 0)
		{
			var timeSurvived = Date.now() - timeWhenGameStarted;
			console.log('You lost! You survived for ' + timeSurvived + " ms.");
			startNewGame();
		}
	}
	
	return self;
}

Actor= function(type, id, x, y, width, height, img, hp, attackSpeed)
{
	var self = Entity(type, id, x, y, width, height, img);
	self.hp = hp;
	self.attackSpeed = attackSpeed;
	self.attackCounter = 0;
	self.aimAngle = 0;
	
	self.performAttack = function()
	{
		if(self.attackCounter > 25)
		{
			self.attackCounter = 0;
			generateBullet(self);
		}
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		self.attackCounter += self.attackSpeed;
	}
	
	self.performSpecialAttack = function()
	{
		if(self.attackCounter > 50)
		{
			self.attackCounter = 0;
			/*
			for(var i = 0; i < 360; i++)
			{
				generateBullet(self, i);
			}
			*/
			generateBullet(self, self.aimAngle - 5);
			generateBullet(self, self.aimAngle);
			generateBullet(self, self.aimAngle + 5);
		}
	}
	
	return self;
}

Enemy = function(id, x, y, width, height)
{
	var self = Actor('enemy', id, x, y, width, height, Img.enemy, 10, 1);
	
	self.updateAim = function()
	{
		var differenceX = player.x - self.x;
		var differenceY = player.y - self.y;
		
		self.aimAngle = Math.atan2(differenceY, differenceX) / Math.PI * 180;
	}
	
	self.updatePosition = function()
	{
		var differenceX = player.x - self.x;
		var differenceY = player.y - self.y;
		
		if(differenceX > 0)
		{
			self.x += 3;
		}
		else
		{
			self.x -= 3;
		}
		
		if(differenceY > 0)
		{
			self.y += 3;
		}
		else
		{
			self.y -= 3;
		}
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		self.updateAim();
		self.performAttack();
	}
	
	enemyList[id] = self;
}

randomlyGenerateEnemy = function()
{
	var x = Math.random() * currentMap.width;
	var y = Math.random() * currentMap.height;
	var width = 64;
	var height = 64;
	var id = Math.random();
	
	Enemy(id, x, y, width, height);
}

Upgrade = function(id, x, y, width, height, category, img)
{
	var self = Entity('upgrade', id, x, y, width, height, img);
	self.category = category;	
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		var isColliding = player.testCollision(self);
		if(isColliding)
		{
			if(self.category === 'score')
			{
				score += 100;
			}
			if(self.category === 'attackSpeed')
			{
				player.attackSpeed += 3;
			}
			delete upgradeList[self.id];
		}
	}
	
	upgradeList[id] = self;
}

randomlyGenerateUpgrade = function()
{
	var x = Math.random() * currentMap.width;
	var y = Math.random() * currentMap.height;
	var width = 32;
	var height = 32;
	var id = Math.random();
	
	if(Math.random() < 0.5)
	{
		var category = 'score';
		var img = Img.upgrade1;
	}
	else
	{
		var category = 'attackSpeed';
		var img = Img.upgrade2;
	}
	
	Upgrade(id, x, y, width, height, category, img);
}

Bullet = function(id, x, y, spdX, spdY, width, height, combatType)
{
	var self = Entity('bullet', id, x, y, width, height, Img.bullet);
	
	self.timer = 0;
	self.combatType = combatType;
	self.spdX = spdX;
	self.spdY = spdY;
	
	self.updatePosition = function()
	{
		self.x += self.spdX;
		self.y += self.spdY;
			
		if(self.x < 0 || self.x > currentMap.width)
		{
			self.spdX = -self.spdX;
		}
		if(self.y < 0 || self.y > currentMap.height)
		{
			self.spdY = -self.spdY;
		}
	}
	
	var super_update = self.update;
	self.update = function()
	{
		super_update();
		var toRemove = false;
		self.timer++;
		if(self.timer > 75)
		{
			toRemove = true;
		}
		
		if(self.combatType === 'player')
		{
			for(var enemy in enemyList)
			{
				if(self.testCollision(enemyList[enemy]))
				{
					toRemove = true;
					delete enemyList[enemy];
				}
			}
		}
		else if(self.combatType === 'enemy')
		{
			if(self.testCollision(player))
			{
				toRemove = true;
				player.hp -= 1;
			}
		}
		
		if(toRemove)
		{
			delete bulletList[self.id];
		}
	}
	
	bulletList[id] = self;
}

generateBullet = function(actor, overwriteAngle)
{
	var x = actor.x;
	var y = actor.y;
	var width = 32;
	var height = 32;
	var id = Math.random();
	
	var angle = actor.aimAngle;
	if(overwriteAngle !== undefined)
	{
		angle = overwriteAngle;
	}
	var spdX = Math.cos(angle / 180 * Math.PI) * 5;
	var spdY = Math.sin(angle / 180 * Math.PI) * 5;
	Bullet(id, x, y, spdX, spdY, width, height, actor.type);
}