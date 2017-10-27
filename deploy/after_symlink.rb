on_app_servers do
  run "ln -nfs #{config.shared_path}/config/application.yml #{config.current_path}/config/application.yml"
end
