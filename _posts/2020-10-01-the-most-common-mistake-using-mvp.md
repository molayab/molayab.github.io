---
layout: post
title:  "The most common mistake using MVP"
tags: software-architecture notes
category: software-development
author: Mateo Olaya
excerpt_separator: <!--more-->
cover_image: https://www.newbreedmarketing.com/hs-fs/hubfs/shutterstock_595643366.jpg?width=2500&name=shutterstock_595643366.jpg
---

MVP is a powerful architectural pattern to define UIs, it works on the major of the modern developments, it allows the use of more complex architectural approaches defining a bridge between the view and the business. This extra layer allows us to keep decouple the view logic from a view's coordinator called presenter.

<!--more-->

If you have developed a mobile application, maybe you have been heard about MVP. It is an [architecture pattern](https://en.wikipedia.org/wiki/Architectural_pattern) that separates the business-responsibility from the view, adding a new artifact called the presenter. In synthesis, the approach is pretty easy to follow. It defines three artifacts: ***the view***, ***the presenter***, and ***the model***. All those work together to enforce the single responsibility (SR) and separation of concerns (SoC) principles. *A priori* it seems to be easy to follow, and detonates that at least the view will contain all view-related logic, the model will carry all the data needed to build the view and the presenter will orchestrate everything following some business-related logic. In the notebook, it sounds perfect!

Some approaches uses MVP just as internal part of the overall architecture, most commonly used on the presentation layer, using the presenter as a bridge between the other parts of more complex architectures. Making this patter very flexible and powerful. Let's check what MVP defines: 

![MVP Overview](https://upload.wikimedia.org/wikipedia/commons/d/dc/Model_View_Presenter_GUI_Design_Pattern.png)

 - **Model**: Business-related logic (following a CLEAN approach, UseCases)
 - **Presenter**: View's coordinator
 - **View**: View-related code (in iOS normally UIKit or SwiftUI)

![MVP iOS](https://miro.medium.com/max/2800/1*j95UZOgvPFdWVqDCbn8o2A.png)

Let's check the overall idea deeper. Let's separate the two main actors in MVP, we have to create a View context that will contain the presenter's public interface. On the other hand, we also have the Presenter that should contain a view's public interface. The presenter must only use the view's reference in order to communicate updates, avoiding coupling the View with the Presenter.

MVP when you are using UIKit framework:
[MVP iOS UIKit](https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTerIF1YyBCKFuMAiCJZ8YYn9VJy8aFwYiJTQ&usqp=CAU)

It's important to keep separate the concerns of each artifact, it means that the view must only contain view-related logic, the presenter must not contain any view-related logic, and models are the typing definition of the data required in order to construct the UI. 

When you move your UI to a modular approach keeping well separated the responsibilities between the artifacts, you can switch the artifacts as required with the minimum overall intrusion. Let's say that you have an iOS application that uses UIKit for the Views, but you recently learned about SwiftUI and you want to update your app to this brand-new UI framework. Following the correct MVP's approach, this is very easy, because you View artifact is the only one that knows view-related logic. It is just replace it with your new and pretty SwiftUI logic. In order to put it in the app like a lego block, just implements the public interface defined for the View as ViewInterface. Remember that there is where the concrete public definitions for the view are.

But the key in order to achieve it is keep in order the basic principles of SoC and SR.

## What is the most common mistake using presenters?

Well, there are some issues that people normally do when uses MVP approaches. The main one is violate the SR and SoC principles that allows decouple and well-abstract the code, making it imposible to test or to change. Violating those basics principles will move your wanted modular-code into a monolithic one, carring seriouly issues.

Presenter MUST NOT contain any synced return in his public interface, this is the most common mistake and it is sutile due the pattern arch definition. Let's see an example using Swift:

```swift
// Remember that protocol == interface in Swift.
protocol ConcretePresenterProtocol: PresenterProtocol {
    var view: ConcreteViewProtocol?

    func getWelcomeViewModel() -> SomeViewModel
}

protocol ConcreteViewProtocol: ViewProtocol { }

final class ConcreteView: ConcreteViewProtocol {
    private var presenter: ConcretePresenterProtocol?

    func didAppear() {
        let viewModel = presenter?.getWelcomeViewModel()
        // Configure something with the view model...
    }
}
```

The previous code is violating the MVP due to a return type in the presenter's public interface. In this case, the view's responsibility is to get the data from the presenter using a synced approach that couples contextual logic, it should know at some point all the possible ways that the presenter can work, generating confusion, and most developers will move all view-related logic to the presenter, asking to it for everything that the views needs to draw. It is a wrong approach due to the arrows in the MVP's definition was changed just for use a `return`, let's see:

```
MVP DEFINES 
[ View ] -- knows --> [ PresenterInterface ] -- notifies  --> [ ViewInterface ] <-- implements -- [ View ]

But if you add the return in the public interface the change is a pretty sutile:
[ View ] <-- knows / asks --> [ PresenterInterface ] -- notifies  --> [ ViewInterface ] <-- implements -- [ View ]

Coupling 
[ View ] <-- knows / asks --> [ PresenterInterface ]
[ View ] <---> [ PresenterInterface ]
```

### How can we solve this? 
Well, the fix is pretty simple, just remember to always use the view's public interface reference inside the presenter. That is the key to keep everything decoupled. Remember that the Presenter exposes behaviors. It means that is preferred have a method in the presenter's interface that acts over an action, for example `func fetchWelcomeState()` rather than have the `getWelcomeViewModel() -> SomeViewModel`. Let's say for example, your welcome view model comes from a service call, it may not be a synced call, and the view doesn't need to know that. The reference in the presenter helps us with that. Let's see the correct way of defining previous code: 

```swift
// Remember that protocol == interface in Swift.
protocol ConcretePresenterProtocol: PresenterProtocol {
    var view: ConcreteViewProtocol?
    func fetchWelcomeState()
}
final class ConcretePresenter: ConcretePresenterProtocol { 
    var view: ConcreteViewProtocol?
    func fetchWelcomeState() {
        // fetch your data as needed, when ready:
        let viewModel = // required view model for the render.
        view.showingWelcomeState(viewModel: viewModel)
    }
}

protocol ConcreteViewProtocol: ViewProtocol {
    func showingWelcomeState(viewModel: SomeViewModel)
}
final class ConcreteView: ConcreteViewProtocol {
    private var presenter: ConcretePresenterProtocol?

    func didAppear() {
        presenter.fetchWelcomeState()
    }

    func showingWelcomeState(viewModel: SomeViewModel) {
        // Configure something with the view model...
    }
}
```
The code above keeps in order the principles described and uses a well-defined MVP approach, guaranteeing the modularity of the artifacts, just using the view's reference in the correct way. Check that if concrete view changes, the only required change in the above code is to ensure that the new view's object implements **ConcreteViewProtocol** that contains the public interface for the behaviors that the view should define. Also, check how easy is to test the presenter mocking the view and the view using UI tests.

### Conclusion 

MVP is a powerful architectural pattern to define UIs, it works on the major of the modern developments, it allows the use of more complex architectural approaches defining a bridge between the view and the business. This extra layer allows us to keep decouple the view logic from a view's coordinator called presenter. 

MVP is a great tool to use, but keep in mind the basic principles in order to avoid move its definition to a monolithic approach that won't guarantee any of the MVP advantages. 

Use always the view's reference using descriptive behaviors (methods). It will keep your code modular, testable, and easy to read.

Use MVP as required, we don't have to redo the implementation, check the diagram definitions in order to avoid breaking the architectural definition.

### References

 - [Wikipedia: Model–view–presenter](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter)
 - [Model View Presenter(MVP) in Android with a simple demo project.](https://medium.com/cr8resume/make-you-hand-dirty-with-mvp-model-view-presenter-eab5b5c16e42)
 - [GUI Architectures](https://martinfowler.com/eaaDev/uiArchs.html)
 - [Design Patterns: Model View Presenter - Microsoft Docs](https://docs.microsoft.com/en-us/archive/msdn-magazine/2006/august/design-patterns-model-view-presenter)
 - [Implement a Model-View-Presenter Architecture in Swift 5](https://medium.com/better-programming/implement-a-model-view-presenter-architecture-in-swift-5-dfa21bbb8e0b)