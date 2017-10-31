class User::SessionsController < Devise::SessionsController
  respond_to :js

  def create
    self.resource = warden.authenticate!(auth_options)
    set_flash_message!(:notice, :signed_in)
    sign_in(resource_name, resource)
    yield resource if block_given?
    @after_sign_in_path_for = after_sign_in_path_for(resource)
    respond_with resource, location: @after_sign_in_path_for
  end
end
