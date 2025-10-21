Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  Rails.application.routes.draw do
  namespace :api do
    resources :games
    resources :logs
  end
end
end
