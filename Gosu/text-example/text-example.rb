require 'gosu'

class TextExample < Gosu::Window
	def initialize
		super 640, 480
		self.caption = "Text Example"

		@font = Gosu::Font.new(32, name: "Nimbus Mono L")
    end

	def draw
		@font.draw("Otter.Tech Rocks My Socks!", 10, 20, 0)
	end
end

window = TextExample.new.show
