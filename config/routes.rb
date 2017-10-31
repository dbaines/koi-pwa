Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'user/sessions'
  }
  get '/styleguide/:action' => 'styleguide'
  get '/styleguide' => 'styleguide#index'
  resources :uploads do
    post :image, on: :collection
  end
  resources :documents, only: [:show]
  resources :images, only: [:show]
  resources :assets, only: [:show]
  resources :pages, only: [:index, :show], as: :koi_pages
  root to: 'pages#index'
  mount Koi::Engine => "/admin", as: "koi_engine"
  get "/:id"  => "pages#show", as: :page
end
