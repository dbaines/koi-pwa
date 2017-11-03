Rails.application.routes.draw do

  # Service Worker
  get '/service-worker', to: "application#service_worker", format: :js

  # Static routes
  get '/geolocation', to: "application#geolocation", as: :geolocation
  get '/notifications', to: "application#notifications", as: :notifications

  # Users 
  devise_for :users, controllers: {
    sessions: 'user/sessions'
  }
  
  # Koi Assets and Uploads
  resources :uploads do
    post :image, on: :collection
  end
  resources :documents, only: [:show]
  resources :images, only: [:show]
  resources :assets, only: [:show]

  # Koi pages and modules 
  resources :pages, only: [:index, :show], as: :koi_pages

  # Homepage 
  root to: 'pages#index'

  # Koi Namespace 
  mount Koi::Engine => "/admin", as: "koi_engine"

  # Fallback pages routes 
  get "/:id"  => "pages#show", as: :page
end
