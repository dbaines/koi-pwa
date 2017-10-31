class ApplicationController < ActionController::Base

  include CommonControllerActions

  protect_from_forgery except: :service_worker

end
