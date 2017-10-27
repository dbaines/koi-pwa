Airbrake.configure do |config|
  config.api_key    = Figaro.env.airbrake_api_key
  config.host       = Figaro.env.airbrake_host
  config.port       = Figaro.env.airbrake_port.to_i
  config.secure     = Figaro.env.airbrake_secure == 'true'
  config.project_id = Figaro.env.airbrake_api_key
end

class Airbrake::Sender
  def json_api_enabled?
    true
  end
end
