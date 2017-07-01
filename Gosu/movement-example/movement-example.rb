require 'gosu'

class MovementExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Movement Example"
		@ball = Gosu::Image.new("./ball.png")
		@ball_x = self.width / 2
		@ball_y = self.height / 2
		@ball_angle = 0
		@ball_vx = 25 + rand(150)
		@ball_vy = 25 + rand(150)
		@ball_va = 45 + rand(15)
	end

	def draw
		@ball.draw_rot( @ball_x, @ball_y, 0, @ball_angle )
	end

	def update
		@ball_angle += @ball_va * self.update_interval / 1000
		@ball_x += @ball_vx * self.update_interval / 1000
		@ball_y += @ball_vy * self.update_interval / 1000
		if @ball_x - @ball.width/2 < 0 or @ball_x + @ball.width/2 > 640 then
			@ball_vx *= -1
		end
		if @ball_y - @ball.height/2 < 0 or @ball_y + @ball.height/2 > 480 then
			@ball_vy *= -1
		end     
	end 
end

window = MovementExample.new.show

