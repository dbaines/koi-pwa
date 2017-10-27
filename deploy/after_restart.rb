on_app_servers do
  sudo "monit restart all -g koi_pwa_sidekiq"
end
