
import SwiftUI

@available(iOS 13.0.0, *)
struct SplashScreen: View {
    var body: some View {
        ZStack(alignment: .topLeading) {
            GeometryReader { geometry in
                Image(uiImage: UIImage(named: "ny_ic_splash_bg") ?? UIImage())
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height)
                    .clipped()
                    .background(Color(.systemYellow))
                Image(uiImage: UIImage(named: "splash_logo") ?? UIImage())
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 153, height: 105.5)
                    .clipped()
                    .position(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height / 2)
                Image(uiImage: UIImage(named: "splash_footer") ?? UIImage())
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 130, height: 100)
                    .clipped()
                    .position(x: UIScreen.main.bounds.width / 2, y:geometry.size.height - 50)
            }
        }
        .frame(width:UIScreen.main.bounds.width, height: UIScreen.main.bounds.height)
        .edgesIgnoringSafeArea(.all)
    }
}

struct ContentView_Previews: PreviewProvider {
    @available(iOS 13.0.0, *)
    static var previews: some View{
        SplashScreen()
    }
}
