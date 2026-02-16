const neverHaveIEverScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TicketCardStack
          title="Jeg har aldrig"
          body="...glemt at mobilepay for drinks i byen"
          cornerLabel="Jeg har aldrig"
          brand="Booze Game"
          maxCards={3}
          backgroundImageSource={require('./assets/wood-table.png')}
        />
      </View>
    </SafeAreaView>
  );
};