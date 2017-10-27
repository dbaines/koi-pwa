module CommonControllerActions

  extend ActiveSupport::Concern

  included do
    protect_from_forgery
    layout :layout_by_resource
    helper :all
    helper Koi::NavigationHelper
    helper_method :seo
    before_filter :sign_in_as_admin! if Rails.env.development?
  end

  protected

  # FIXME: Hack to set layout for admin devise resources
  def layout_by_resource
    if devise_controller? && resource_name == :admin
      "koi/devise"
    else
      "application"
    end
  end

  # FIXME: Hack to redirect back to admin after admin login
  def after_sign_in_path_for(resource_or_scope)
    resource_or_scope.is_a?(Admin) ? koi_engine.root_path : super
  end

  # FIXME: Hack to redirect back to admin after admin logout
  def after_sign_out_path_for(resource_or_scope)
    resource_or_scope == :admin ? koi_engine.root_path : super
  end

  def sign_in_as_admin!
    sign_in(:admin, Admin.first) unless Admin.all.empty?
  end

  def seo(name)
    begin
      is_a_resource? ? resource.setting(name, nil, role: 'Admin') : resource_class.setting(name, nil, role: 'Admin')
    rescue
    end
  end

  # Is the current page an Inherited Resources resource?
  def is_a_resource?
    begin
      !!resource
    rescue
      false
    end
  end

end
