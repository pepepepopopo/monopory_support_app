Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  namespace :api do
    resources :games, only: [:index, :create, :update, :destroy]
    resources :logs, only: [:index, :create, :update, :destroy]
end
end
