
on the frontend we will use global auth for forms, since the
state is complex and across components

we will have a login and signup and premium subscription, all
features will be shown, but using features will be blocked
depending on whether the user is logged in or not or has
a subscription

for certain parts of the app we will have multi-step forms and
modals for things like verification codes and onboarding

we will use tanstack query for caching api reqs, and axios for
our api layer, and axios interceptors for token management