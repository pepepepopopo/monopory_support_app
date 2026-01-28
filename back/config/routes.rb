Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  namespace :api do
    resources :games, param: :join_token do
      resources :players, only: [:index]
    end
    resources :players, only: [:index, :create, :update, :destroy]
    resources :logs, only: [:index, :create, :update, :destroy]
  end
end
