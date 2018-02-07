# -*- coding: utf-8 -*-
# Configures your navigation
SimpleNavigation.register_renderer :sf_menu => SfMenuRenderer
SimpleNavigation.register_renderer :active_items => ActiveItemsRenderer
SimpleNavigation.register_renderer :ornament_menu => OrnamentNavRenderer
SimpleNavigation::Configuration.run do |navigation|
end
