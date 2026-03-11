Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  get "/health" => proc {
    ActiveRecord::Base.connection.execute("SELECT 1")
    [200, { "Content-Type" => "text/plain" }, ["ok"]]
  }
  namespace :api do
    resources :games, param: :join_token, only: [:show, :create, :destroy] do
      resources :players, only: [:index]
      resources :logs, only: [:index, :create]
      member do
        post :start
        post :finish
      end
    end
    resources :players, only: [:create, :update, :destroy]
  end
end
